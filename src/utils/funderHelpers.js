/**
 * Funder-specific data fetching helpers.
 * Pure functions — fetch messages, enrich with IPFS data.
 */

import {
  getMessages,
  getProposalStatus,
  getMilestoneStatus,
  buildGrantSummary,
} from "./grantFlowHelpers";
import { getData } from "@/lib/utils";

// ─── Get Funder's Grants ─────────────────────────────────────────────

/**
 * Fetch all grants created by a funder, enriched with IPFS data.
 * @param {string} funderWallet - the funder's account ID
 */
export async function getMyGrants(funderWallet) {
  const messages = await getMessages();

  const grantMessages = messages.filter(
    (m) => m.type === "GRANT_CREATED" && m.funder === funderWallet,
  );

  const grants = await Promise.all(
    grantMessages.map(async (msg) => {
      try {
        const grantData = await getData(msg.ipfsHash);
        return buildGrantSummary(msg, grantData, messages);
      } catch (err) {
        console.error(`[GrantFlow] Failed to fetch grant ${msg.grantId}:`, err);
        return {
          grantId: msg.grantId,
          funder: msg.funder,
          createdAt: msg.timestamp,
          title: "(Unable to load)",
          _error: true,
        };
      }
    }),
  );

  // Newest first
  return grants.sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Get Applications for a Grant ────────────────────────────────────

/**
 * Fetch all proposals submitted for a specific grant.
 * @param {string} grantId
 */
export async function getGrantApplications(grantId) {
  const messages = await getMessages();

  const proposalMessages = messages.filter(
    (m) => m.type === "PROPOSAL_SUBMITTED" && m.grantId === grantId,
  );

  const applications = await Promise.all(
    proposalMessages.map(async (msg) => {
      try {
        const proposalData = await getData(msg.ipfsHash);
        const status = getProposalStatus(messages, msg.proposalId);

        return {
          ...proposalData,
          proposalId: msg.proposalId,
          recipient: msg.recipient,
          submittedAt: msg.timestamp,
          status,
        };
      } catch (err) {
        console.error(
          `[GrantFlow] Failed to fetch proposal ${msg.proposalId}:`,
          err,
        );
        return {
          proposalId: msg.proposalId,
          recipient: msg.recipient,
          submittedAt: msg.timestamp,
          status: getProposalStatus(messages, msg.proposalId),
          name: "(Unable to load)",
          _error: true,
        };
      }
    }),
  );

  // Pending first, then by date
  return applications.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return b.submittedAt - a.submittedAt;
  });
}

// ─── Get Pending Milestone Reviews ───────────────────────────────────

/**
 * Find all milestone submissions that haven't been approved/revised yet,
 * across all of a funder's grants.
 * @param {string} funderWallet
 */
export async function getPendingMilestoneReviews(funderWallet) {
  const messages = await getMessages();

  // All grants created by this funder
  const myGrantIds = messages
    .filter((m) => m.type === "GRANT_CREATED" && m.funder === funderWallet)
    .map((m) => m.grantId);

  const pendingReviews = [];

  for (const grantId of myGrantIds) {
    // All milestone submissions for this grant
    const submissions = messages.filter(
      (m) => m.type === "MILESTONE_SUBMITTED" && m.grantId === grantId,
    );

    for (const sub of submissions) {
      const status = getMilestoneStatus(
        messages,
        sub.proposalId,
        sub.milestoneIndex,
      );

      // Only include if still pending review
      if (status !== "pending_review") continue;

      // Get the proposal info
      const proposal = messages.find(
        (m) =>
          m.type === "PROPOSAL_SUBMITTED" && m.proposalId === sub.proposalId,
      );

      try {
        // Get the grant's IPFS data for milestone names
        const grantMsg = messages.find(
          (m) => m.type === "GRANT_CREATED" && m.grantId === grantId,
        );
        const grantData = grantMsg ? await getData(grantMsg.ipfsHash) : {};

        // Get proof data
        const proofData = sub.ipfsHash ? await getData(sub.ipfsHash) : {};

        pendingReviews.push({
          ...sub,
          proofData,
          recipient: proposal?.recipient || sub.proposalId,
          grantTitle: grantData.title || grantId,
          milestoneName:
            grantData.milestones?.[sub.milestoneIndex]?.name ||
            `Milestone ${sub.milestoneIndex + 1}`,
          milestoneAmount:
            grantData.milestones?.[sub.milestoneIndex]?.amount || 0,
        });
      } catch (err) {
        console.error("[GrantFlow] Error enriching review:", err);
        pendingReviews.push({
          ...sub,
          recipient: proposal?.recipient || "unknown",
          grantTitle: grantId,
          milestoneName: `Milestone ${sub.milestoneIndex + 1}`,
        });
      }
    }
  }

  // Oldest first (longest waiting = highest priority)
  return pendingReviews.sort((a, b) => a.timestamp - b.timestamp);
}

// ─── Get Past Milestone Reviews ───────────────────────────────────

/**
 * Find all milestone submissions that HAVE been approved or rejected
 * across all of a funder's grants.
 * @param {string} funderWallet
 */
export async function getPastMilestoneReviews(funderWallet) {
  const messages = await getMessages();

  // All grants created by this funder
  const myGrantIds = messages
    .filter((m) => m.type === "GRANT_CREATED" && m.funder === funderWallet)
    .map((m) => m.grantId);

  const pastReviews = [];

  for (const grantId of myGrantIds) {
    // All milestone submissions for this grant
    const submissions = messages.filter(
      (m) => m.type === "MILESTONE_SUBMITTED" && m.grantId === grantId,
    );

    for (const sub of submissions) {
      const status = getMilestoneStatus(
        messages,
        sub.proposalId,
        sub.milestoneIndex,
      );

      // Only include if no longer pending
      if (status === "pending_review") continue;

      // Get the proposal info
      const proposal = messages.find(
        (m) =>
          m.type === "PROPOSAL_SUBMITTED" && m.proposalId === sub.proposalId,
      );

      try {
        // Get the grant's IPFS data for milestone names
        const grantMsg = messages.find(
          (m) => m.type === "GRANT_CREATED" && m.grantId === grantId,
        );
        const grantData = grantMsg ? await getData(grantMsg.ipfsHash) : {};

        // Get proof data
        const proofData = sub.ipfsHash ? await getData(sub.ipfsHash) : {};

        pastReviews.push({
          ...sub,
          proofData,
          status,
          recipient: proposal?.recipient || sub.proposalId,
          grantTitle: grantData.title || grantId,
          milestoneName:
            grantData.milestones?.[sub.milestoneIndex]?.name ||
            `Milestone ${sub.milestoneIndex + 1}`,
          milestoneAmount:
            grantData.milestones?.[sub.milestoneIndex]?.amount || 0,
        });
      } catch (err) {
        console.error("[GrantFlow] Error enriching past review:", err);
      }
    }
  }

  // Newest first (most recently approved/rejected)
  return pastReviews.sort((a, b) => b.timestamp - a.timestamp);
}

// ─── Get All Grants (for explore / public view) ──────────────────────

/**
 * Fetch all grants from the topic, enriched with IPFS data.
 * No wallet filter — returns everything.
 */
export async function getAllGrants() {
  const messages = await getMessages();

  const grantMessages = messages.filter((m) => m.type === "GRANT_CREATED");

  const grants = await Promise.all(
    grantMessages.map(async (msg) => {
      try {
        const grantData = await getData(msg.ipfsHash);
        return buildGrantSummary(msg, grantData, messages);
      } catch (err) {
        console.error(`[GrantFlow] Failed to fetch grant ${msg.grantId}:`, err);
        return {
          grantId: msg.grantId,
          funder: msg.funder,
          createdAt: msg.timestamp,
          title: "(Unable to load)",
          _error: true,
        };
      }
    }),
  );

  return grants.sort((a, b) => b.createdAt - a.createdAt);
}
