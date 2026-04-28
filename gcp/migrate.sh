#!/bin/bash
# Run Prisma migrations via Cloud SQL Auth Proxy
# Use this for the initial schema push and future migrations
#
# Prerequisites:
#   - Cloud SQL Auth Proxy installed:
#     https://cloud.google.com/sql/docs/postgres/sql-proxy#install
#   - DATABASE_URL set to the proxy connection string
#
# Usage:
#   export PROJECT_ID=your-project-id
#   export REGION=europe-west2
#   bash gcp/migrate.sh

set -e

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${REGION:-europe-west2}"
DB_INSTANCE="biosense-db"
DB_NAME="biosense"
DB_USER="biosense_user"
PROXY_PORT=5433

# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" \
  --project="$PROJECT_ID" \
  --format="value(connectionName)")

echo "Starting Cloud SQL Auth Proxy for: $CONNECTION_NAME"

# Start proxy in background
cloud-sql-proxy "$CONNECTION_NAME" --port="$PROXY_PORT" &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 3

# Get the password from Secret Manager
DB_PASS=$(gcloud secrets versions access latest \
  --secret=DATABASE_URL \
  --project="$PROJECT_ID" | \
  sed 's|.*://[^:]*:\([^@]*\)@.*|\1|')

export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:$PROXY_PORT/$DB_NAME"

echo "Running Prisma migrations..."
npx prisma db push --accept-data-loss

echo "✓ Schema pushed to Cloud SQL"

# Stop proxy
kill $PROXY_PID
echo "✓ Proxy stopped"
