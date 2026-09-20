#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT="${DEPLOY_RUN_PORT:-${PORT:-5000}}"

cd "${COZE_WORKSPACE_PATH}"

echo "Starting MoveShopify migration module on port ${PORT}..."
pnpm next start --hostname 0.0.0.0 --port "${PORT}"
