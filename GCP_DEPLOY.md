# BioSense — GCP Deployment Guide

## Architecture on GCP

```
GitHub (main) → Cloud Build → Artifact Registry (Docker) → Cloud Run
                                                                ↓
                                                         Cloud SQL (Postgres 15)
                                                         Secret Manager (all env vars)
                                                         Cloud Scheduler (cron jobs)
                                                         Cloudflare R2 (PDFs — external)
```

## Infrastructure

| Service | Purpose | Cost |
|---------|---------|------|
| **Cloud Run** | App hosting — scales to zero | ~$0 at low traffic |
| **Cloud SQL** | PostgreSQL 15 (`db-f1-micro`) | ~$7/month |
| **Cloud Build** | CI/CD on push to main | 120 free mins/day |
| **Artifact Registry** | Docker image storage | ~$0.10/GB/month |
| **Cloud Scheduler** | Cron jobs (weekly/monthly reports, anomaly checks) | Free tier: 3 jobs |
| **Secret Manager** | All environment variables | ~$0.06/secret/month |

**Estimated total: ~$10–20/month** at low user volumes. Cloud Run scales to zero when idle.

---

## One-time setup

### 1. Prerequisites
```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud auth configure-docker europe-west2-docker.pkg.dev

# Set your project
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID
```

### 2. Run the setup script
```bash
export PROJECT_ID=your-gcp-project-id
export REGION=europe-west2   # closest region to your users
chmod +x gcp/setup.sh
bash gcp/setup.sh
```

This provisions:
- Enables all required APIs
- Creates Artifact Registry repo
- Creates Cloud SQL PostgreSQL instance + database + user
- Creates all Secret Manager secrets
- Configures IAM permissions

### 3. Populate the remaining secrets
```bash
# Anthropic
echo -n "sk-ant-..." | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-

# NextAuth secret (generate one)
echo -n "$(openssl rand -base64 32)" | gcloud secrets versions add NEXTAUTH_SECRET --data-file=-

# Stripe
echo -n "sk_live_..." | gcloud secrets versions add STRIPE_SECRET_KEY --data-file=-
echo -n "whsec_..." | gcloud secrets versions add STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "price_..." | gcloud secrets versions add STRIPE_MONTHLY_PRICE_ID --data-file=-
echo -n "price_..." | gcloud secrets versions add STRIPE_ANNUAL_PRICE_ID --data-file=-

# Resend
echo -n "re_..." | gcloud secrets versions add RESEND_API_KEY --data-file=-
echo -n "BioSense <noreply@yourdomain.com>" | gcloud secrets versions add EMAIL_FROM --data-file=-

# Cloudflare R2
echo -n "your-account-id" | gcloud secrets versions add R2_ACCOUNT_ID --data-file=-
echo -n "your-key-id" | gcloud secrets versions add R2_ACCESS_KEY_ID --data-file=-
echo -n "your-secret" | gcloud secrets versions add R2_SECRET_ACCESS_KEY --data-file=-
echo -n "biosense-pdfs" | gcloud secrets versions add R2_BUCKET_NAME --data-file=-

# Cron secret (any random string)
echo -n "$(openssl rand -base64 24)" | gcloud secrets versions add CRON_SECRET --data-file=-

# Wearable OAuth
echo -n "your-oura-client-id" | gcloud secrets versions add OURA_CLIENT_ID --data-file=-
echo -n "your-oura-secret" | gcloud secrets versions add OURA_CLIENT_SECRET --data-file=-
echo -n "your-whoop-client-id" | gcloud secrets versions add WHOOP_CLIENT_ID --data-file=-
echo -n "your-whoop-secret" | gcloud secrets versions add WHOOP_CLIENT_SECRET --data-file=-
```

### 4. Push the database schema
```bash
# Install Cloud SQL Auth Proxy
# https://cloud.google.com/sql/docs/postgres/sql-proxy#install

export PROJECT_ID=your-project-id
export REGION=europe-west2
chmod +x gcp/migrate.sh
bash gcp/migrate.sh
```

### 5. Connect GitHub to Cloud Build
1. Go to Cloud Build → **Triggers** in GCP Console
2. Click **Connect Repository** → GitHub
3. Authorise and select `Shift-ai-tech-ORG/BioSense-App`
4. Create a trigger:
```bash
gcloud builds triggers create github \
  --name=biosense-deploy \
  --repo-name=BioSense-App \
  --repo-owner=Shift-ai-tech-ORG \
  --branch-pattern='^main$' \
  --build-config=cloudbuild.yaml \
  --substitutions=_REGION=europe-west2,_SERVICE=biosense,_REPO=biosense-repo,_CLOUDSQL_INSTANCE=YOUR_PROJECT:europe-west2:biosense-db \
  --project=$PROJECT_ID
```

### 6. First deployment
```bash
# Trigger manually or push to main
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=europe-west2,_SERVICE=biosense,_REPO=biosense-repo,_CLOUDSQL_INSTANCE=YOUR_PROJECT:europe-west2:biosense-db \
  .
```

### 7. Get the Cloud Run URL and update NEXTAUTH_URL
```bash
SERVICE_URL=$(gcloud run services describe biosense \
  --region=europe-west2 \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"

# Update the secret
echo -n "$SERVICE_URL" | gcloud secrets versions add NEXTAUTH_URL --data-file=-

# Redeploy to pick up the new value
gcloud run deploy biosense --image=europe-west2-docker.pkg.dev/$PROJECT_ID/biosense-repo/biosense:latest \
  --region=europe-west2
```

### 8. Set up cron jobs
```bash
export SERVICE_URL=$(gcloud run services describe biosense --region=europe-west2 --format='value(status.url)')
export CRON_SECRET=$(gcloud secrets versions access latest --secret=CRON_SECRET)
export REGION=europe-west2
chmod +x gcp/scheduler.sh
bash gcp/scheduler.sh
```

### 9. Set up Stripe webhook
In the Stripe dashboard, add a webhook endpoint:
```
https://your-service-url/api/billing/webhook
```
Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Local development

```bash
# Clone and install
git clone https://github.com/Shift-ai-tech-ORG/BioSense-App
cd BioSense-App
npm install

# Set up local .env (use Neon free tier for Postgres: https://neon.tech)
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY at minimum

# Push schema
npx prisma db push

# Run
npm run dev
```

---

## Custom domain (optional)

```bash
# Map a custom domain to Cloud Run
gcloud run domain-mappings create \
  --service=biosense \
  --domain=app.yourdomain.com \
  --region=europe-west2
```

Then update your DNS with the provided records and update `NEXTAUTH_URL` to your custom domain.

---

## Region choices

| Region | Location | Notes |
|--------|----------|-------|
| `europe-west2` | London, UK | Good for UAE + Europe |
| `me-central2` | Doha, Qatar | Closest to UAE — check pricing |
| `asia-south1` | Mumbai | Alternative for UAE proximity |
| `us-central1` | Iowa, USA | Cheapest, lowest latency if users are global |
