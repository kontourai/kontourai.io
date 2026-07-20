#!/usr/bin/env bash

set -euo pipefail

npm run build
npm run validate
test -f dist/index.html
