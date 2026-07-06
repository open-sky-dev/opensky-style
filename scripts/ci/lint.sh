#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

bun install --frozen-lockfile
cd packages/style
bunx tsc --noEmit
