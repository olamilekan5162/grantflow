import { getConnector } from "@/lib/walletConnect";
import {
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hiero-ledger/sdk";

const useHedera = () => {
  const createTopic = async (accountId) => {
    if (!accountId) {
      console.log("wallet not connected");
      return;
    }
    try {
      const connector = getConnector();
      const signer = connector.getSigner(AccountId.fromString(accountId));

      const transaction = await new TopicCreateTransaction()
        .setTopicMemo("Registry Topic")
        .executeWithSigner(signer);

      const transactionId = transaction.transactionId;
      console.log("Transaction ID:", transactionId.toString());

      return transactionId;
    } catch (e) {
      console.log("error", e);
    }
  };

  const submitMessage = async (accountId, topicId, message) => {
    console.log(topicId, message);
    if (!accountId) {
      console.log("wallet not connected");
      return;
    }
    if (!topicId || !message) {
      console.log("incomplete params");
    }

    try {
      const connector = getConnector();
      const signer = connector.getSigner(AccountId.fromString(accountId));

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .executeWithSigner(signer);

      const transactionId = transaction.transactionId;
      console.log("Transaction ID:", transactionId.toString());

      return transactionId;
    } catch (e) {
      console.log("error", e);
    }
  };
  return { createTopic, submitMessage };
};

export default useHedera;
