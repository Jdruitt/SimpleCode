import { describe, expect, it } from "vite-plus/test";

import { summarizeAgentSessionImport } from "./agentSessionImportSummary";

describe("summarizeAgentSessionImport", () => {
  it("reports the conversation count for the project", () => {
    expect(summarizeAgentSessionImport({ imported: 12, skipped: 0, failed: false }, "API")).toEqual(
      {
        type: "success",
        title: "Conversations imported",
        description: "12 conversations from Claude Code and Codex are now in API.",
      },
    );
  });

  it("keeps a single conversation singular", () => {
    expect(
      summarizeAgentSessionImport({ imported: 1, skipped: 0, failed: false }, "API").description,
    ).toBe("1 conversation from Claude Code and Codex is now in API.");
  });

  it("asks for another run while conversations remain", () => {
    expect(
      summarizeAgentSessionImport({ imported: 100, skipped: 7, failed: false }, "API"),
    ).toEqual({
      type: "success",
      title: "Conversations imported",
      description:
        "100 conversations from Claude Code and Codex are now in API. 7 were skipped this run; import again to continue.",
    });
  });

  it("says so when there was nothing to import", () => {
    expect(summarizeAgentSessionImport({ imported: 0, skipped: 0, failed: false }, "API")).toEqual({
      type: "success",
      title: "No conversations to import",
      description: "Claude Code and Codex have no recent conversations for API.",
    });
  });

  it("reports a total failure as an error", () => {
    expect(summarizeAgentSessionImport({ imported: 0, skipped: 0, failed: true }, "API")).toEqual({
      type: "error",
      title: "Could not import conversations",
      description: "Nothing was imported into API.",
    });
  });

  it("keeps partial progress visible when part of the run failed", () => {
    expect(summarizeAgentSessionImport({ imported: 4, skipped: 0, failed: true }, "API")).toEqual({
      type: "error",
      title: "Some conversations could not be imported",
      description: "4 conversations from Claude Code and Codex are now in API.",
    });
  });
});
