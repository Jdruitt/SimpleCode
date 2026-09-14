/**
 * Toast copy for a conversation import run.
 *
 * The server reports how many transcripts it matched for the project and how
 * many it left for a later run, and a project can span several environments,
 * so a run is summed before it is described. Kept apart from the React hook so
 * the wording, which is the part that misleads when it drifts, can be read and
 * tested on its own.
 */
export interface AgentSessionImportTotals {
  /** Conversations the project now holds from disk, including ones already there. */
  readonly imported: number;
  /** Conversations left for a later run, usually because a per-run budget ran out. */
  readonly skipped: number;
  /** Whether any environment in the run failed outright. */
  readonly failed: boolean;
}

export interface AgentSessionImportSummary {
  readonly type: "success" | "error";
  readonly title: string;
  readonly description: string;
}

function conversations(count: number): string {
  return `${count} conversation${count === 1 ? "" : "s"} from Claude Code and Codex ${
    count === 1 ? "is" : "are"
  } now in`;
}

export function summarizeAgentSessionImport(
  totals: AgentSessionImportTotals,
  projectLabel: string,
): AgentSessionImportSummary {
  if (totals.imported === 0) {
    return totals.failed
      ? {
          type: "error",
          title: "Could not import conversations",
          description: `Nothing was imported into ${projectLabel}.`,
        }
      : {
          type: "success",
          title: "No conversations to import",
          description: `Claude Code and Codex have no recent conversations for ${projectLabel}.`,
        };
  }

  // A skipped count is normal rather than a fault: an import reads a bounded
  // number of transcripts, so a large history needs more than one run.
  const remaining =
    totals.skipped > 0
      ? ` ${totals.skipped} ${totals.skipped === 1 ? "was" : "were"} skipped this run; import again to continue.`
      : "";
  return {
    type: totals.failed ? "error" : "success",
    title: totals.failed ? "Some conversations could not be imported" : "Conversations imported",
    description: `${conversations(totals.imported)} ${projectLabel}.${remaining}`,
  };
}
