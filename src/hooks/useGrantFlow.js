/**
 * React hook that wraps GrantFlow helpers with loading/error state.
 * Provides convenient data loading functions for pages.
 */

"use client";

import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { getMessages, invalidateCache } from "@/utils/grantFlowHelpers";
import {
  getMyGrants,
  getGrantApplications,
  getPendingMilestoneReviews,
  getPastMilestoneReviews,
  getAllGrants,
} from "@/utils/funderHelpers";
import {
  getAvailableGrants,
  getMyApplications,
  getGrantDetails,
} from "@/utils/recipientHelpers";

export function useGrantFlow() {
  const { account } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Wraps an async function with loading/error state management.
   */
  const withLoading = useCallback(
    (fn) =>
      async (...args) => {
        setLoading(true);
        setError(null);
        try {
          const result = await fn(...args);
          return result;
        } catch (err) {
          console.error("[useGrantFlow]", err);
          setError(err.message || "Something went wrong");
          return null;
        } finally {
          setLoading(false);
        }
      },
    [],
  );

  // ─── Funder Functions ────────────────────────────────────────────

  const loadMyGrants = useCallback(
    () => withLoading(getMyGrants)(account),
    [account, withLoading],
  );

  const loadGrantApplications = useCallback(
    (grantId) => withLoading(getGrantApplications)(grantId),
    [withLoading],
  );

  const loadPendingReviews = useCallback(
    () => withLoading(getPendingMilestoneReviews)(account),
    [account, withLoading],
  );

  const loadPastReviews = useCallback(
    () => withLoading(getPastMilestoneReviews)(account),
    [account, withLoading],
  );

  // ─── Recipient Functions ─────────────────────────────────────────

  const loadAvailableGrants = useCallback(
    () => withLoading(getAvailableGrants)(account),
    [account, withLoading],
  );

  const loadMyApplications = useCallback(
    () => withLoading(getMyApplications)(account),
    [account, withLoading],
  );

  const loadGrantDetails = useCallback(
    (grantId) => withLoading(getGrantDetails)(grantId),
    [withLoading],
  );

  // ─── General ─────────────────────────────────────────────────────

  const loadAllGrants = useCallback(
    () => withLoading(getAllGrants)(),
    [withLoading],
  );

  const refresh = useCallback(async () => {
    invalidateCache();
    await getMessages(true);
  }, []);

  return {
    loading,
    error,
    account,
    // Funder
    loadMyGrants,
    loadGrantApplications,
    loadPendingReviews,
    loadPastReviews,
    // Recipient
    loadAvailableGrants,
    loadMyApplications,
    loadGrantDetails,
    // General
    loadAllGrants,
    refresh,
  };
}
