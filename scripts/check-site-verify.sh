#!/usr/bin/env bash

set -euo pipefail

npm run build
npm run validate
test -f dist/index.html
printf '%s\n' 'ok 1 - dist/index.html generated' '1..1'
