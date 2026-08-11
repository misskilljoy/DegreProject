---
name: preview-and-push
description: Implement requested project changes, verify them, launch a local browser preview, collect review evidence, ask the user whether everything is acceptable, and only after explicit approval commit and push the scoped changes to the repository's master branch. Use when the user asks to change, fix, redesign, or add something and wants a local preview followed by an approval-gated deployment or push to master.
---

# Preview and Push

Apply a requested change and guide it through local verification to an explicitly approved push. Treat the approval gate as mandatory and never infer approval from the original implementation request.

## Workflow

1. Inspect repository instructions, status, current branch, remotes, and relevant files before editing.
2. Preserve all pre-existing user changes. Record the initial status and never stage, revert, overwrite, or commit unrelated files.
3. Implement only the requested change using the repository's established patterns.
4. Run the most relevant available checks. Report failures honestly; do not weaken or skip checks merely to obtain a passing result.
5. Discover the documented preview command from repository files. For this project, prefer `npx live-server .` from the repository root; if dependencies or network access are unavailable, use a suitable already-installed static server.
6. Start the preview in a persistent terminal session, wait until it is ready, and open its local URL in the browser. Keep the server running during review unless that would conflict with the user's environment.
7. Inspect the result. For visual work, exercise the affected flow and provide screenshots or equivalent visual evidence when the available tools support it. Also summarize tests, changed files, and the exact diff intended for commit.
8. Ask a blocking question equivalent to: "Всё выглядит нормально? Коммитить и отправлять эти изменения в `master`?" Do not commit or push before receiving an explicit affirmative answer in a later user message.
9. If the user requests corrections, make them, repeat verification and preview, then ask for approval again. Prior approval becomes stale after any material edit.
10. After explicit approval, re-check `git status`, the current branch, the target remote, and the staged diff. Stage only the reviewed files. Never use broad staging such as `git add .` or `git add -A` when unrelated changes exist.
11. Create a concise commit, then push the approved commit to `origin/master`. If the repository uses another default branch, explain the mismatch and obtain approval before changing the target.
12. Report the commit hash, pushed branch, verification results, and any user changes left uncommitted.

## Approval and Safety Rules

- Interpret only an unambiguous response such as "да, пушь", "всё ок", or "approve" as approval.
- Treat silence, a request to preview, or the initial request to implement as insufficient approval for the final commit and push.
- Never force-push, rewrite history, delete branches, bypass branch protection, or use destructive Git commands.
- Do not include credentials, local configuration, generated caches, or unrelated work in the commit.
- If the local branch is behind or has diverged, stop before integrating remote changes and explain the situation to the user.
- If opening a browser or pushing requires a permission prompt, request that permission only at the relevant step.
- Keep the review possible from Codex Remote: include concise progress, test output, changed-file summaries, and screenshots when feasible so the user can approve from a phone without relying solely on the desktop browser.

## Completion Criteria

Finish only when either the approved commit is present on `origin/master`, or a concrete blocker has been reported without misrepresenting the change as deployed.
