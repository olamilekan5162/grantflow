/**
 * Recipient-specific data fetching helpers.
 * Pure functions — fetch messages, enrich with IPFS data.
 */

import {
  getMessages,
  getProposalStatus,
  getMilestoneStatus,
} from "./grantFlowHelpers";
import { getData } from "@/lib/utils";

// ─── Get Available Grants ────────────────────────────────────────────

/**
 * Fetch all grants, with info about whether the recipient has already applied.
 * @param {string} recipientWallet
 */
export async function getAvailableGrants(recipientWallet) {
  const messages = await getMessages();

  const grantMessages = messages.filter((m) => m.type === "GRANT_CREATED");

  const grants = await Promise.all(
    grantMessages.map(async (grantMsg) => {
      try {
        const grantData = await getData(grantMsg.ipfsHash);

        // Check if this recipient already applied
        const myApplication = messages.find(
          (m) =>
            m.type === "PROPOSAL_SUBMITTED" &&
            m.grantId === grantMsg.grantId &&
            m.recipient === recipientWallet,
        );

        // Check deadline
        if (
          grantData.deadline &&
          new Date(grantData.deadline).getTime() < Date.now()
        ) {
          // Include expired grants but mark them
          return {
            ...grantData,
            grantId: grantMsg.grantId,
            funder: grantMsg.funder,
            createdAt: grantMsg.timestamp,
            applied: !!myApplication,
            applicationStatus: myApplication
              ? getProposalStatus(messages, myApplication.proposalId)
              : null,
            applicationId: myApplication?.proposalId || null,
            expired: true,
          };
        }

        return {
          ...grantData,
          grantId: grantMsg.grantId,
          funder: grantMsg.funder,
          createdAt: grantMsg.timestamp,
          applied: !!myApplication,
          applicationStatus: myApplication
            ? getProposalStatus(messages, myApplication.proposalId)
            : null,
          applicationId: myApplication?.proposalId || null,
          expired: false,
        };
      } catch (err) {
        console.error(
          `[GrantFlow] Failed to fetch grant ${grantMsg.grantId}:`,
          err,
        );
        return null;
      }
    }),
  );

  return grants.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Get Recipient's Applications ────────────────────────────────────

/**
 * Fetch all proposals submitted by a recipient, with full grant + milestone status info.
 * @param {string} recipientWallet
 */
export async function getMyApplications(recipientWallet) {
  const messages = await getMessages();

  const myProposals = messages.filter(
    (m) => m.type === "PROPOSAL_SUBMITTED" && m.recipient === recipientWallet,
  );

  const applications = await Promise.all(
    myProposals.map(async (proposal) => {
      try {
        // Get grant details
        const grantMsg = messages.find(
          (m) => m.type === "GRANT_CREATED" && m.grantId === proposal.grantId,
        );
        const grantData = grantMsg ? await getData(grantMsg.ipfsHash) : {};

        // Get proposal full data
        const proposalData = await getData(proposal.ipfsHash);

        // Get status
        const status = getProposalStatus(messages, proposal.proposalId);

        // Get milestone progress (only if proposal is approved and grant has milestones)
        const milestones = (grantData.milestones || []).map((m, index) => {
          const milestoneStatus = getMilestoneStatus(
            messages,
            proposal.proposalId,
            index,
          );
          return {
            ...m,
            index,
            status: milestoneStatus,
          };
        });

        return {
          ...proposalData,
          grantId: proposal.grantId,
          grantTitle: grantData.title || proposal.grantId,
          grantBudget: grantData.budget || grantData.totalBudget || 0,
          proposalId: proposal.proposalId,
          submittedAt: proposal.timestamp,
          status,
          milestones,
          hasPendingReviews: milestones.some(
            (m) => m.status === "pending_review",
          ),
          hasRevisions: milestones.some(
            (m) => m.status === "revision_requested",
          ),
          completedMilestones: milestones.filter(
            (m) => m.status === "completed",
          ).length,
          totalMilestones: milestones.length,
        };
      } catch (err) {
        console.error(
          `[GrantFlow] Failed to fetch application ${proposal.proposalId}:`,
          err,
        );
        return {
          proposalId: proposal.proposalId,
          grantId: proposal.grantId,
          grantTitle: proposal.grantId,
          submittedAt: proposal.timestamp,
          status: getProposalStatus(messages, proposal.proposalId),
          milestones: [],
          _error: true,
        };
      }
    }),
  );

  // Sort: approved first, then pending, then rejected
  const priority = { approved: 1, pending: 2, rejected: 3 };
  return applications.sort(
    (a, b) => (priority[a.status] || 4) - (priority[b.status] || 4),
  );
}

// ─── Get Next Available Milestone ────────────────────────────────────

/**
 * Given a list of milestones (with .status), find the next one to work on.
 * Returns null if nothing is actionable.
 */
export function getNextMilestone(milestones) {
  for (const m of milestones) {
    if (m.status === "revision_requested") return m; // Resubmit needed
    if (m.status === "available") return m;
    if (m.status === "pending_review") return m; // Waiting on reviewer
  }
  return null; // All done or locked
}

// ─── Get Grant Details (for a specific grant) ────────────────────────

/**
 * Fetch full details for a single grant by grantId.
 * Includes all proposals and their statuses.
 */
export async function getGrantDetails(grantId) {
  const messages = await getMessages();

  const grantMsg = messages.find(
    (m) => m.type === "GRANT_CREATED" && m.grantId === grantId,
  );

  if (!grantMsg) return null;

  try {
    const grantData = await getData(grantMsg.ipfsHash);

    const proposals = messages.filter(
      (m) => m.type === "PROPOSAL_SUBMITTED" && m.grantId === grantId,
    );

    return {
      ...grantData,
      grantId,
      funder: grantMsg.funder,
      createdAt: grantMsg.timestamp,
      applicationCount: proposals.length,
      applications: proposals.map((p) => ({
        proposalId: p.proposalId,
        recipient: p.recipient,
        submittedAt: p.timestamp,
        status: getProposalStatus(messages, p.proposalId),
      })),
    };
  } catch (err) {
    console.error(`[GrantFlow] Failed to fetch grant ${grantId}:`, err);
    return null;
  }
}
