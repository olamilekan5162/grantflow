/**
 * Submission helpers for GrantFlow.
 * Each function handles uploading to IPFS (if needed) and submitting an HCS message.
 * They take accountId as a param and use the connector directly — no React hooks.
 */

import { getConnector } from "@/lib/walletConnect";
import {
  AccountId,
  TopicMessageSubmitTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  HbarUnit,
} from "@hiero-ledger/sdk";
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

  const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;
  const totalBudgetHbar = grantData.totalBudget || grantData.budget || 0;
  let txId = null;
  if (contractId && totalBudgetHbar > 0) {
    const connector = getConnector();
    if (!connector) throw new Error("Connector not initialized");
    const signer = connector.getSigner(AccountId.fromString(accountId));

    try {
      const escrowTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(500000)
        .setFunction(
          "deposit",
          new ContractFunctionParameters().addString(grantId),
        )
        .setPayableAmount(new Hbar(totalBudgetHbar, HbarUnit.Hbar))
        .executeWithSigner(signer);

      txId = escrowTx.transactionId?.toString();
      console.log("[GrantFlow] Escrow Deposit TX:", txId);
    } catch (err) {
      console.error("[GrantFlow] Failed to deposit to escrow:", err);
      throw new Error(
        "Failed to lock funds in Escrow Contract. Do you have enough HBAR?",
      );
    }
  }

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
    txId, // Include escrow tx ID
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
  recipientAddress,
  amountInHbar,
) {
  const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;
  let txId = null;

  if (contractId && recipientAddress && amountInHbar > 0) {
    const connector = getConnector();
    if (!connector) throw new Error("Connector not initialized");
    const signer = connector.getSigner(AccountId.fromString(accountId));

    try {
      // Convert Hedera account ID (e.g. 0.0.12345) to Solidity Address format
      const recipientSolidityAddress =
        AccountId.fromString(recipientAddress).toSolidityAddress();

      const escrowTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(500000)
        .setFunction(
          "release",
          new ContractFunctionParameters()
            .addString(grantId)
            .addAddress(recipientSolidityAddress)
            .addUint256(
              new Hbar(amountInHbar, HbarUnit.Hbar).toTinybars().toString(),
            ),
        )
        .executeWithSigner(signer);

      txId = escrowTx.transactionId?.toString();
      console.log("[GrantFlow] Escrow Release TX:", txId);
    } catch (err) {
      console.error("[GrantFlow] Escrow Release Failed:", err);
      throw new Error(
        `Failed to disburse milestone funds from Escrow: ${err.message}`,
      );
    }
  }

  await submitToTopic(accountId, {
    type: "MILESTONE_APPROVED",
    grantId,
    proposalId,
    milestoneIndex,
    approvedBy: accountId,
    txId, // Include escrow release tx ID
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
