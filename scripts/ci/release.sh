#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

# Guard: the pushed tag must match the package version
TAG="${GITHUB_REF_NAME:?GITHUB_REF_NAME not set — this script runs from the release workflow}"
VERSION=$(bun -e "console.log(require('./packages/style/package.json').version)")
if [ "v$VERSION" != "$TAG" ]; then
	echo "Tag $TAG does not match package version $VERSION" >&2
	exit 1
fi

bun install --frozen-lockfile
cd packages/style
bun test

# prepublishOnly runs the build
npm publish
