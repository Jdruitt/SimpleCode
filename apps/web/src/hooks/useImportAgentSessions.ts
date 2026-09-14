import { isAtomCommandInterrupted, settlePromise } from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId, ProjectId } from "@t3tools/contracts";
import { useCallback } from "react";

import {
  summarizeAgentSessionImport,
  type AgentSessionImportTotals,
} from "../agentSessionImportSummary";
import { readLocalApi } from "../localApi";
import { agentSessionImport } from "../state/agentSessions";
import { useAtomCommand } from "../state/use-atom-command";
import { toastManager } from "../components/ui/toast";

export interface ImportAgentSessionsTarget {
  readonly environmentId: EnvironmentId;
  readonly projectId: ProjectId;
  readonly workspaceRoot: string;
}

/**
 * Pull Claude Code and Codex history into a project the user already has.
 *
 * Onboarding runs the same server command once, over projects the user is
 * about to create. This is the way back to it: history keeps accruing on disk
 * long after setup, and re-running it also lets threads pick up names written
 * by a newer version of the title rules. Confirms first, because a project
 * spanning several machines reads each of them.
 */
export function useImportAgentSessions() {
  const importThreads = useAtomCommand(agentSessionImport, { reportFailure: false });

  return useCallback(
    async (targets: ReadonlyArray<ImportAgentSessionsTarget>, projectLabel: string) => {
      if (targets.length === 0) return;
      // No local shell means no way to ask, and importing unasked is worse
      // than doing nothing.
      const api = readLocalApi();
      if (api === undefined) return;
      const confirmed = await settlePromise(() =>
        api.dialogs.confirm(
          [
            `Import conversations into ${projectLabel}?`,
            "T3 Code reads recent Claude Code and Codex history for this project's folder and adds any conversation it does not have yet. Conversations you have continued here are left alone.",
          ].join("\n"),
        ),
      );
      if (confirmed._tag === "Failure" || !confirmed.value) return;

      const progressToast = toastManager.add({
        type: "loading",
        title: `Importing conversations into ${projectLabel}…`,
        timeout: 0,
      });
      // Each member is its own environment, so one unreachable machine must
      // not discard what the others already imported.
      const totals: {
        -readonly [K in keyof AgentSessionImportTotals]: AgentSessionImportTotals[K];
      } = { imported: 0, skipped: 0, failed: false };
      for (const target of targets) {
        const result = await importThreads({
          environmentId: target.environmentId,
          input: { projectId: target.projectId, expectedWorkspaceRoot: target.workspaceRoot },
        });
        if (result._tag === "Success") {
          totals.imported += result.value.importedCount;
          totals.skipped += result.value.skippedCount;
        } else if (isAtomCommandInterrupted(result)) {
          toastManager.close(progressToast);
          return;
        } else {
          totals.failed = true;
        }
      }
      toastManager.update(progressToast, summarizeAgentSessionImport(totals, projectLabel));
    },
    [importThreads],
  );
}
