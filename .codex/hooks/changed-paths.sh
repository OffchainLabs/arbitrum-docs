#!/usr/bin/env bash
# Print one path per line for the files a hook event touches.
# Reads the hook JSON on stdin. Codex reports apply_patch edits as the patch
# text in tool_input.command; Claude Code reports tool_input.file_path.
# Paths print absolute, resolved against the cwd (patch paths are relative).
# Never fails: unparsable input prints nothing.
set -uo pipefail

python3 -c '
import json, os, re, sys
try:
    data = json.load(sys.stdin)
except ValueError:
    sys.exit(0)
tool_input = data.get("tool_input") or {}
if not isinstance(tool_input, dict):
    sys.exit(0)
file_path = tool_input.get("file_path")
if isinstance(file_path, str) and file_path:
    print(os.path.abspath(file_path))
command = tool_input.get("command")
if isinstance(command, str):
    for match in re.finditer(r"^\*\*\* (?:Add|Update|Delete) File: (.+)$", command, re.M):
        print(os.path.abspath(match.group(1).strip()))
' 2>/dev/null || true
