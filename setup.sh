#!/bin/bash
# ─────────────────────────────────────────────
# Design OS — Setup Script
# Installs the Design OS Navigator extension
# in Cursor or VS Code.
# ─────────────────────────────────────────────

set -e

VSIX_PATH="design-os-navigator/design-os-navigator-0.1.0.vsix"

# Check VSIX exists
if [ ! -f "$VSIX_PATH" ]; then
  echo "Error: $VSIX_PATH not found."
  echo "Run this script from the project root."
  exit 1
fi

# Detect editor (Cursor first, then VS Code)
if command -v cursor &> /dev/null; then
  EDITOR_CMD="cursor"
  EDITOR_NAME="Cursor"
elif command -v code &> /dev/null; then
  EDITOR_CMD="code"
  EDITOR_NAME="VS Code"
else
  echo "Neither Cursor nor VS Code CLI found."
  echo ""
  echo "Manual install:"
  echo "  1. Open Cursor/VS Code"
  echo "  2. Cmd+Shift+P → 'Extensions: Install from VSIX'"
  echo "  3. Select: $VSIX_PATH"
  exit 1
fi

echo "Installing Design OS Navigator in $EDITOR_NAME..."
$EDITOR_CMD --install-extension "$VSIX_PATH"

echo ""
echo "Done! Open this folder in $EDITOR_NAME:"
echo "  $EDITOR_CMD ."
echo ""
echo "The Navigator will open automatically on first launch."
