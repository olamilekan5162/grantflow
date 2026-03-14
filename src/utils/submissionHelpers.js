/**
 * Submission helpers for GrantFlow.
 * Each function handles uploading to IPFS (if needed) and submitting an HCS message.
 * They take accountId as a param and use the connector directly — no React hooks.
 */

import { getConnector } from "@/lib/walletConnect";
import { AccountId, TopicMessageSubmitTransaction } from "@hiero-ledger/sdk";
import { uploadData } from "@/lib/utils";
import { invalidateCache } from "./grantFlowHelpers";

const TOPIC_ID = process.env.NEXT_PUBLIC_REGISTRY_TOPIC_ID;

/**
 * Internal: submit a JSON message to the global HCS topic.
 */
async function submitToTopic(accountId, messageObj) {
  const connector = getConnector();
  if (!connector) throw new Error("Connector not initialized");

  const signer = connector.getSigner(AccountId.fromString(accountId));

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(TOPIC_ID)
    .setMessage(JSON.stringify(messageObj))
    .executeWithSigner(signer);

  console.log("[GrantFlow] HCS tx:", tx.transactionId?.toString());

  // Invalidate cache so next read gets fresh data
  invalidateCache();

  return tx.transactionId?.toString();
}

/**
 * Generate a unique ID with a prefix.
 */
function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ─── Grant Submission (Funder) ───────────────────────────────────────

export async function submitGrant(accountId, grantData) {
  const grantId = makeId("grant");

  // Upload full grant data to IPFS
  const ipfsHash = await uploadData({
    ...grantData,
    grantId,
    funder: accountId,
    createdAt: Date.now(),
  });

  // Submit pointer to HCS
  await submitToTopic(accountId, {
    type: "GRANT_CREATED",
    grantId,
    funder: accountId,
    ipfsHash,
    timestamp: Date.now(),
  });

  return grantId;
}

// ─── Proposal Submission (Recipient) ─────────────────────────────────

export async function submitProposal(accountId, grantId, proposalData) {
  const proposalId = makeId("prop");

  const ipfsHash = await uploadData({
    ...proposalData,
    proposalId,
    grantId,
    recipient: accountId,
    submittedAt: Date.now(),
  });

  await submitToTopic(accountId, {
    type: "PROPOSAL_SUBMITTED",
    grantId,
    proposalId,
    recipient: accountId,
    ipfsHash,
    timestamp: Date.now(),
  });

  return proposalId;
}

// ─── Proposal Decisions (Funder) ─────────────────────────────────────

export async function approveProposal(accountId, grantId, proposalId) {
  await submitToTopic(accountId, {
    type: "PROPOSAL_APPROVED",
    grantId,
    proposalId,
    approvedBy: accountId,
    timestamp: Date.now(),
  });
}

export async function rejectProposal(accountId, grantId, proposalId, reason) {
  await submitToTopic(accountId, {
    type: "PROPOSAL_REJECTED",
    grantId,
    proposalId,
    rejectedBy: accountId,
    reason,
    timestamp: Date.now(),
  });
}

// ─── Milestone Submission (Recipient) ────────────────────────────────

export async function submitMilestoneProof(
  accountId,
  grantId,
  proposalId,
  milestoneIndex,
  proofData,
) {
  const ipfsHash = await uploadData({
    ...proofData,
    proposalId,
    grantId,
    milestoneIndex,
    submittedAt: Date.now(),
  });

  await submitToTopic(accountId, {
    type: "MILESTONE_SUBMITTED",
    grantId,
    proposalId,
    milestoneIndex,
    ipfsHash,
    timestamp: Date.now(),
  });
}

// ─── Milestone Decisions (Funder / Verifier) ─────────────────────────

export async function approveMilestone(
  accountId,
  grantId,
  proposalId,
  milestoneIndex,
) {
  await submitToTopic(accountId, {
    type: "MILESTONE_APPROVED",
    grantId,
    proposalId,
    milestoneIndex,
    approvedBy: accountId,
    timestamp: Date.now(),
  });
}

export async function requestMilestoneRevision(
  accountId,
  grantId,
  proposalId,
  milestoneIndex,
  feedback,
) {
  await submitToTopic(accountId, {
    type: "MILESTONE_REVISION_REQUESTED",
    grantId,
    proposalId,
    milestoneIndex,
    requestedBy: accountId,
    feedback,
    timestamp: Date.now(),
  });
}
