/**
 * Core helpers for GrantFlow data flow.
 * Pure functions — no React hooks. Import from anywhere.
 */

const TOPIC_ID = process.env.NEXT_PUBLIC_REGISTRY_TOPIC_ID;
const MIRROR_BASE = "https://testnet.mirrornode.hedera.com/api/v1";

// ─── Message Fetching with Pagination ────────────────────────────────

/**
 * Fetch ALL messages from the global topic, handling mirror-node pagination.
 * Mirror node returns max 100 per page.
 */
export async function fetchAllMessages() {
  let allMessages = [];
  let url = `${MIRROR_BASE}/topics/${TOPIC_ID}/messages?limit=100&order=asc`;
  let page = 1;

  do {
    console.log(`[GrantFlow] Fetching messages page ${page}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mirror node error: ${response.status}`);

    const data = await response.json();

    const parsed = (data.messages || [])
      .map((msg) => {
        try {
          // Mirror node returns base64-encoded message content
          const decoded = atob(msg.message);
          return {
            ...JSON.parse(decoded),
            _consensusTimestamp: msg.consensus_timestamp,
            _sequenceNumber: msg.sequence_number,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    allMessages = [...allMessages, ...parsed];

    // Check for next page
    url = data.links?.next ? `${MIRROR_BASE}${data.links.next}` : null;
    page++;

    // Safety cap
    if (page > 50) break;
  } while (url);

  console.log(`[GrantFlow] Total messages fetched: ${allMessages.length}`);
  return allMessages;
}

// ─── Caching Layer ───────────────────────────────────────────────────

let messagesCache = {
  data: null,
  lastFetched: 0,
  expiresIn: 30000, // 30 seconds
};

/**
 * Get all messages, using cache if still valid.
 * @param {boolean} forceRefresh - bypass cache
 */
export async function getMessages(forceRefresh = false) {
  const now = Date.now();

  if (
    !forceRefresh &&
    messagesCache.data &&
    now - messagesCache.lastFetched < messagesCache.expiresIn
  ) {
    return messagesCache.data;
  }

  const messages = await fetchAllMessages();

  messagesCache = {
    data: messages,
    lastFetched: now,
    expiresIn: 30000,
  };

  return messages;
}

/** Invalidate the cache so the next getMessages() fetches fresh data. */
export function invalidateCache() {
  messagesCache.data = null;
  messagesCache.lastFetched = 0;
}

// ─── Filters ─────────────────────────────────────────────────────────

export function filterByType(messages, type) {
  return messages.filter((m) => m.type === type);
}

export function filterByGrantId(messages, grantId) {
  return messages.filter((m) => m.grantId === grantId);
}

export function filterByRecipient(messages, recipientWallet) {
  return messages.filter((m) => m.recipient === recipientWallet);
}

export function filterByFunder(messages, funderWallet) {
  return messages.filter((m) => m.funder === funderWallet);
}

// ─── Status Helpers ──────────────────────────────────────────────────

/**
 * Get the most recent message matching a filter function.
 */
export function getLatestMessage(messages, filterFn) {
  const filtered = messages.filter(filterFn);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => b.timestamp - a.timestamp)[0];
}

/**
 * Determine the current status of a proposal.
 * @returns {"pending" | "approved" | "rejected"}
 */
export function getProposalStatus(messages, proposalId) {
  const decision = getLatestMessage(
    messages,
    (m) =>
      (m.type === "PROPOSAL_APPROVED" || m.type === "PROPOSAL_REJECTED") &&
      m.proposalId === proposalId,
  );

  if (!decision) return "pending";
  return decision.type === "PROPOSAL_APPROVED" ? "approved" : "rejected";
}

/**
 * Determine the current status of a milestone.
 * @returns {"locked" | "available" | "pending_review" | "revision_requested" | "completed"}
 */
export function getMilestoneStatus(messages, proposalId, milestoneIndex) {
  // Check if submitted
  const submission = messages.find(
    (m) =>
      m.type === "MILESTONE_SUBMITTED" &&
      m.proposalId === proposalId &&
      m.milestoneIndex === milestoneIndex,
  );

  if (!submission) {
    // First milestone is always available once proposal approved
    if (milestoneIndex === 0) {
      const proposalApproved = messages.find(
        (m) => m.type === "PROPOSAL_APPROVED" && m.proposalId === proposalId,
      );
      return proposalApproved ? "available" : "locked";
    }

    // Others need previous milestone approved
    const prevApproval = messages.find(
      (m) =>
        m.type === "MILESTONE_APPROVED" &&
        m.proposalId === proposalId &&
        m.milestoneIndex === milestoneIndex - 1,
    );
    return prevApproval ? "available" : "locked";
  }

  // Check if approved
  const approval = messages.find(
    (m) =>
      m.type === "MILESTONE_APPROVED" &&
      m.proposalId === proposalId &&
      m.milestoneIndex === milestoneIndex,
  );
  if (approval) return "completed";

  // Check if revision requested
  const revision = messages.find(
    (m) =>
      m.type === "MILESTONE_REVISION_REQUESTED" &&
      m.proposalId === proposalId &&
      m.milestoneIndex === milestoneIndex,
  );
  if (revision) return "revision_requested";

  return "pending_review";
}

/**
 * Build a full grant object from a GRANT_CREATED message + its IPFS data + all related messages.
 * Useful for reducing repeated code across helpers.
 */
export function buildGrantSummary(grantMsg, grantData, allMessages) {
  const grantId = grantMsg.grantId;

  const proposals = allMessages.filter(
    (m) => m.type === "PROPOSAL_SUBMITTED" && m.grantId === grantId,
  );

  const approvedProposals = proposals.filter(
    (p) => getProposalStatus(allMessages, p.proposalId) === "approved",
  );

  return {
    ...grantData,
    grantId,
    funder: grantMsg.funder,
    createdAt: grantMsg.timestamp,
    applicationCount: proposals.length,
    approvedCount: approvedProposals.length,
  };
}
