#!/bin/sh
set -eu
if [ "${RUN_MIGRATIONS_ON_START:-true}" = "true" ]; then
  node scripts/migrate.mjs
fi
exec node server.js
