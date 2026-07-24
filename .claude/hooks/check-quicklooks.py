#!/usr/bin/env python3
"""Stop hook: nudge Claude to add glossary quicklooks to changed docs.

Reads the Stop-hook JSON on stdin. If any docs/**/*.mdx file changed in the
working tree still has unwrapped glossary terms, blocks the stop (exit 2) with
the exact fix command. Fail-soft: any tooling error -> exit 0. Blocks at most
once per turn cycle (guarded by stop_hook_active) so it can never loop.
"""
import json
import os
import subprocess
import sys


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)  # never break the session on a parse hiccup

    # One block cycle max: if a Stop hook is already driving the turn, allow stop.
    if data.get("stop_hook_active"):
        sys.exit(0)

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or "."

    try:
        tracked = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            cwd=project_dir, capture_output=True, text=True, timeout=10,
        )
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=project_dir, capture_output=True, text=True, timeout=10,
        )
    except Exception:
        sys.exit(0)

    names = set(tracked.stdout.splitlines()) | set(untracked.stdout.splitlines())
    docs = [n.strip() for n in names if n.strip().startswith("docs/") and n.strip().endswith(".mdx")]
    if not docs:
        sys.exit(0)

    findings = []
    for rel in docs:
        try:
            result = subprocess.run(
                ["yarn", "--silent", "generate-quicklooks", rel, "--check"],
                cwd=project_dir, capture_output=True, text=True, timeout=90,
            )
        except Exception:
            sys.exit(0)  # fail-soft: tooling missing/slow
        if result.returncode == 1:
            findings.append(result.stdout.strip())
        elif result.returncode != 0:
            sys.exit(0)  # unexpected (e.g. missing glossary) -> don't block

    if findings:
        sys.stderr.write(
            "Some changed docs still have unwrapped glossary terms:\n\n"
            + "\n\n".join(findings)
            + "\n\nWrap them before finishing: run "
            "`yarn generate-quicklooks <file> --write` on each file listed above, "
            "then review with `git diff`.\n"
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
