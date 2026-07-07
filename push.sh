#!/bin/bash
# ─────────────────────────────────────────────
# push.sh — Safe theme push script
# Usage:
#   ./push.sh dev section-name        → push one file to dev
#   ./push.sh dev                     → push all to dev (safe)
#   ./push.sh live section-name       → push one file to live
#   ./push.sh live                    → push all to live (requires confirmation)
# ─────────────────────────────────────────────

# CONFIG: update these in AGENTS.md and here
DEV_THEME_ID=""    # e.g. 139108221015
LIVE_THEME_ID=""   # e.g. 139122737239

# ─────────────────────────────────────────────

ENV=$1
FILE=$2

if [[ -z "$DEV_THEME_ID" || -z "$LIVE_THEME_ID" ]]; then
  echo "❌ Set DEV_THEME_ID and LIVE_THEME_ID in push.sh first"
  exit 1
fi

if [[ "$ENV" == "dev" ]]; then
  THEME_ID=$DEV_THEME_ID
  FLAGS="--nodelete"
elif [[ "$ENV" == "live" ]]; then
  THEME_ID=$LIVE_THEME_ID
  FLAGS="--nodelete --allow-live"
  if [[ -z "$FILE" ]]; then
    echo "⚠️  Pushing to LIVE theme. Are you sure? (yes/no)"
    read confirm
    if [[ "$confirm" != "yes" ]]; then
      echo "Aborted."
      exit 0
    fi
  fi
else
  echo "Usage: ./push.sh [dev|live] [optional: section-name]"
  echo "  ./push.sh dev hero                → sections/hero.liquid"
  echo "  ./push.sh dev base-css            → assets/base.css"
  echo "  ./push.sh dev                     → full push to dev"
  exit 1
fi

if [[ -n "$FILE" ]]; then
  # Smart file resolution
  if [[ "$FILE" == "base-css" ]]; then
    ONLY="assets/base.css"
  elif [[ "$FILE" == "motion" ]]; then
    ONLY="assets/motion.js"
  elif [[ "$FILE" == "cart" ]]; then
    ONLY="assets/cart.js"
  elif [[ "$FILE" == "header" ]]; then
    ONLY="sections/header.liquid"
  elif [[ "$FILE" == "footer" ]]; then
    ONLY="sections/footer.liquid"
  elif [[ -f "sections/${FILE}.liquid" ]]; then
    ONLY="sections/${FILE}.liquid"
  elif [[ -f "assets/${FILE}.css" ]]; then
    ONLY="assets/${FILE}.css"
  elif [[ -f "assets/${FILE}.js" ]]; then
    ONLY="assets/${FILE}.js"
  else
    echo "❌ File not found: ${FILE}"
    echo "   Tried: sections/${FILE}.liquid, assets/${FILE}.css, assets/${FILE}.js"
    exit 1
  fi
  echo "🚀 Pushing $ONLY → $ENV (theme $THEME_ID)"
  shopify theme push --theme $THEME_ID --only $ONLY $FLAGS
else
  echo "🚀 Full push → $ENV (theme $THEME_ID)"
  shopify theme push --theme $THEME_ID $FLAGS
fi
