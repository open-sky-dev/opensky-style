#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

bun install --frozen-lockfile

# Type-checks the package
bun run check

# Runtime tests
bun run test
