#!/usr/bin/env bash
set -euo pipefail

BASE_VERSION="0.1.0"
GIT_HASH=$(git rev-parse --short HEAD || echo "nogit")

echo "${BASE_VERSION}+${GIT_HASH}"
