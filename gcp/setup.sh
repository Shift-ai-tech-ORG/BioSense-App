#!/bin/bash
# ── BioSense GCP One-Time Setup ───────────────────────────────────────────────
# Run this once to provision all required GCP infrastructure
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - PROJECT_ID set below or via: export PROJECT_ID=your-project-id
#   - Billing enabled on the project
#
# Usage:
#   export PROJECT_ID=your-project-id
#   export REGION=europe-west2   # or us-central1, asia-southeast1, etc.
#   bash gcp/setup.sh

set -e

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${REGION:-europe-west2}"
SERVICE="biosense"
REPO="biosense-repo"
DB_INSTANCE="biosense-db"
DB_NAME="biosense"
DB_USER="biosense_user"

echo "════════════════════════════════════════════"
echo " BioSense GCP Setup"
echo " Project:  $PROJECT_ID"
echo " Region:   $REGION"
echo "════════════════════════════════════════════"
echo ""

# ── Enable required APIs ──────────────────────────────────────────────────────
echo "▸ Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  --project="$PROJECT_ID"
echo "✓ APIs enabled"

# ── Artifact Registry for Docker images ──────────────────────────────────────
echo ""
echo "▸ Creating Artifact Registry..."
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="BioSense Docker images" \
  --project="$PROJECT_ID" \
  2>/dev/null || echo "  (already exists)"
echo "✓ Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO"

# ── Cloud SQL (PostgreSQL 15) ─────────────────────────────────────────────────
echo ""
echo "▸ Creating Cloud SQL instance (this takes ~5 minutes)..."
gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --project="$PROJECT_ID" \
  2>/dev/null || echo "  (already exists)"

# Create database
gcloud sql databases create "$DB_NAME" \
  --instance="$DB_INSTANCE" \
  --project="$PROJECT_ID" \
  2>/dev/null || echo "  (db already exists)"

# Create user (generates random password — you must set it below)
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="$DB_PASS" \
  --project="$PROJECT_ID" \
  2>/dev/null || echo "  (user already exists)"

# Get connection name for DATABASE_URL
CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" \
  --project="$PROJECT_ID" \
  --format="value(connectionName)")

echo "✓ Cloud SQL instance: $DB_INSTANCE"
echo ""
echo "  Connection name: $CONNECTION_NAME"
echo "  DATABASE_URL (save this!):"
echo "  postgresql://$DB_USER:$DB_PASS@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"

# ── Secret Manager ────────────────────────────────────────────────────────────
echo ""
echo "▸ Creating secrets in Secret Manager..."
bash "$(dirname "$0")/secrets.sh"

# Store the database URL automatically
echo -n "postgresql://$DB_USER:$DB_PASS@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME" | \
  gcloud secrets versions add DATABASE_URL --data-file=- --project="$PROJECT_ID"
echo "✓ DATABASE_URL stored in Secret Manager"

# Store NEXTAUTH_URL placeholder (update after first deploy)
echo -n "https://$SERVICE-xxxx-ew.a.run.app" | \
  gcloud secrets versions add NEXTAUTH_URL --data-file=- --project="$PROJECT_ID" \
  2>/dev/null || true

# ── Grant Cloud Build / Cloud Run service account access to secrets ───────────
echo ""
echo "▸ Configuring IAM permissions..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
BUILD_SA="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
RUN_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Cloud Build: needs to push to Artifact Registry + deploy to Cloud Run
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BUILD_SA" \
  --role="roles/run.admin" --quiet
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BUILD_SA" \
  --role="roles/iam.serviceAccountUser" --quiet

# Cloud Run runtime: needs to read secrets + connect to Cloud SQL
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$RUN_SA" \
  --role="roles/secretmanager.secretAccessor" --quiet
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$RUN_SA" \
  --role="roles/cloudsql.client" --quiet

echo "✓ IAM permissions configured"

# ── Cloud Build trigger ───────────────────────────────────────────────────────
echo ""
echo "▸ Creating Cloud Build trigger (GitHub → main)..."
echo "  NOTE: You need to connect your GitHub repo in Cloud Build console first."
echo "  Then run:"
echo ""
echo "  gcloud builds triggers create github \\"
echo "    --name=biosense-deploy \\"
echo "    --repo-name=BioSense-App \\"
echo "    --repo-owner=Shift-ai-tech-ORG \\"
echo "    --branch-pattern='^main$' \\"
echo "    --build-config=cloudbuild.yaml \\"
echo "    --substitutions=_REGION=$REGION,_SERVICE=$SERVICE,_REPO=$REPO \\"
echo "    --project=$PROJECT_ID"

echo ""
echo "════════════════════════════════════════════"
echo " Setup complete!"
echo ""
echo " Next steps:"
echo " 1. Add remaining secrets: bash gcp/secrets.sh (then populate each)"
echo " 2. Run prisma db push once: bash gcp/migrate.sh"
echo " 3. Connect GitHub repo in Cloud Build console"
echo " 4. Push to main to trigger first deployment"
echo " 5. After deploy, update NEXTAUTH_URL with real Cloud Run URL"
echo " 6. Run scheduler setup: SERVICE_URL=<url> bash gcp/scheduler.sh"
echo "════════════════════════════════════════════"
