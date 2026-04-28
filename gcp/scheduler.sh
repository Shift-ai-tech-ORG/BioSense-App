#!/bin/bash
# Creates Cloud Scheduler jobs to replace Vercel Cron
# Run this once after deploying the Cloud Run service
#
# Usage:
#   export SERVICE_URL="https://biosense-xxxx-ew.a.run.app"
#   export CRON_SECRET="your-cron-secret"
#   bash gcp/scheduler.sh

set -e

if [ -z "$SERVICE_URL" ] || [ -z "$CRON_SECRET" ]; then
  echo "Error: SERVICE_URL and CRON_SECRET must be set"
  exit 1
fi

REGION="${REGION:-europe-west2}"
PROJECT="${PROJECT:-$(gcloud config get-value project)}"

echo "Creating Cloud Scheduler jobs for project: $PROJECT, region: $REGION"
echo "Service URL: $SERVICE_URL"

# ── Weekly reports — Sunday 7am UTC ──────────────────────────────────────────
gcloud scheduler jobs create http biosense-weekly-reports \
  --location="$REGION" \
  --schedule="0 7 * * 0" \
  --uri="$SERVICE_URL/api/cron/weekly-reports" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --message-body="{}" \
  --time-zone="UTC" \
  --description="Generate weekly health reports for all users" \
  --attempt-deadline=540s \
  --project="$PROJECT" \
  2>/dev/null || \
gcloud scheduler jobs update http biosense-weekly-reports \
  --location="$REGION" \
  --uri="$SERVICE_URL/api/cron/weekly-reports" \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --project="$PROJECT"

echo "✓ Weekly reports scheduler created/updated"

# ── Monthly reports — last day of month, 7am UTC ─────────────────────────────
gcloud scheduler jobs create http biosense-monthly-reports \
  --location="$REGION" \
  --schedule="0 7 28-31 * *" \
  --uri="$SERVICE_URL/api/cron/monthly-reports" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --message-body="{}" \
  --time-zone="UTC" \
  --description="Generate monthly health reports for all users" \
  --attempt-deadline=540s \
  --project="$PROJECT" \
  2>/dev/null || \
gcloud scheduler jobs update http biosense-monthly-reports \
  --location="$REGION" \
  --uri="$SERVICE_URL/api/cron/monthly-reports" \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --project="$PROJECT"

echo "✓ Monthly reports scheduler created/updated"

# ── Anomaly check — every 5 minutes ──────────────────────────────────────────
gcloud scheduler jobs create http biosense-anomaly-check \
  --location="$REGION" \
  --schedule="*/5 * * * *" \
  --uri="$SERVICE_URL/api/cron/anomaly-check" \
  --http-method=POST \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --message-body="{}" \
  --time-zone="UTC" \
  --description="Check for health anomalies and trigger smart notifications" \
  --attempt-deadline=60s \
  --project="$PROJECT" \
  2>/dev/null || \
gcloud scheduler jobs update http biosense-anomaly-check \
  --location="$REGION" \
  --uri="$SERVICE_URL/api/cron/anomaly-check" \
  --headers="x-cron-secret=$CRON_SECRET,Content-Type=application/json" \
  --project="$PROJECT"

echo "✓ Anomaly check scheduler created/updated"
echo ""
echo "All Cloud Scheduler jobs configured."
