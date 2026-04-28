#!/bin/bash
# Creates all required secrets in Google Secret Manager
# Run this once before first deployment
#
# Usage:
#   bash gcp/secrets.sh
# Then populate each secret:
#   echo -n "YOUR_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-

set -e

PROJECT="${PROJECT:-$(gcloud config get-value project)}"

SECRETS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "ANTHROPIC_API_KEY"
  "R2_ACCOUNT_ID"
  "R2_ACCESS_KEY_ID"
  "R2_SECRET_ACCESS_KEY"
  "R2_BUCKET_NAME"
  "R2_PUBLIC_URL"
  "STRIPE_SECRET_KEY"
  "STRIPE_PUBLISHABLE_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "STRIPE_MONTHLY_PRICE_ID"
  "STRIPE_ANNUAL_PRICE_ID"
  "RESEND_API_KEY"
  "EMAIL_FROM"
  "OURA_CLIENT_ID"
  "OURA_CLIENT_SECRET"
  "WHOOP_CLIENT_ID"
  "WHOOP_CLIENT_SECRET"
  "GARMIN_CONSUMER_KEY"
  "GARMIN_CONSUMER_SECRET"
  "CRON_SECRET"
)

echo "Creating secrets in project: $PROJECT"

for SECRET in "${SECRETS[@]}"; do
  gcloud secrets create "$SECRET" \
    --project="$PROJECT" \
    --replication-policy="automatic" \
    2>/dev/null && echo "✓ Created: $SECRET" || echo "  Already exists: $SECRET"
done

echo ""
echo "Now populate each secret with its value:"
echo "  echo -n 'your-value' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo "Example:"
echo "  echo -n 'postgresql://user:pass@host:5432/biosense' | gcloud secrets versions add DATABASE_URL --data-file=-"
