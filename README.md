# ChannelOS — YouTube Automation SaaS

Full-stack YouTube automation platform built with Next.js 15, Supabase, YouTube Data API, Anthropic Claude, and Stripe.

---

## Features

- **AI Comment Replies** — Generate and send context-aware replies using Claude
- **Video Scheduler** — Queue videos for automatic publishing
- **Analytics Dashboard** — Daily performance snapshots with charts
- **SEO Tools** — Keyword research, title optimizer, description generator
- **A/B Thumbnail Testing** — Split-test thumbnails and measure CTR
- **Multi-channel Support** — Manage up to 10 channels (Agency plan)
- **Subscription Billing** — Stripe-powered plans with usage limits

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| YouTube API | Google APIs Node.js Client |
| AI | Anthropic Claude API |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/nikhil170404/youtube-automation.git
cd youtube-automation
npm install
cp .env.example .env.local
```

---

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. After the project is ready, go to **Settings → API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor** and run the migration:

```sql
-- paste the full contents of supabase/migrations/001_schema.sql here
```

5. Go to **Authentication → Providers** and enable:
   - **Email** (enabled by default)
   - **Google** (see step 3 below for credentials)

6. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000` (change to production URL when deploying)
   - Redirect URLs: add `http://localhost:3000/api/auth/callback`

---

### 3. Google Cloud Console (YouTube API + OAuth)

This is the most important step — it gives you access to the YouTube Data API.

#### A. Create a Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `ChannelOS` and click Create

#### B. Enable APIs

In your project, go to **APIs & Services → Library** and enable:
- **YouTube Data API v3**
- **YouTube Analytics API**
- **YouTube Reporting API**

#### C. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** → Create
3. Fill in:
   - App name: `ChannelOS`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. On the **Scopes** step, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
   - `https://www.googleapis.com/auth/yt-analytics.readonly`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Click **Save and Continue** through the rest
7. On the **Test users** step, add your own Gmail address (you need this while the app is in "Testing" mode)

#### D. Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `ChannelOS Web`
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/youtube/callback` (development)
   - `https://yourdomain.com/api/youtube/callback` (production)
6. Click **Create**
7. Copy:
   - **Client ID** → `YOUTUBE_CLIENT_ID`
   - **Client Secret** → `YOUTUBE_CLIENT_SECRET`

#### E. Add to Supabase Google Auth (optional — for Google sign-in)

1. Go to your Supabase project → **Authentication → Providers → Google**
2. Paste the same **Client ID** and **Client Secret**
3. The redirect URL shown by Supabase goes back into Google Console under authorized redirect URIs

---

### 4. Anthropic API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and go to **API Keys**
3. Click **Create Key**, copy it → `ANTHROPIC_API_KEY`

Model usage in this app:
- Comment replies: `claude-haiku-4-5-20251001` (fast, cheap)
- SEO & Video ideas: `claude-sonnet-5-20251101` (higher quality)

---

### 5. Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys**:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

#### Create Products & Prices

Go to **Products → Add Product** and create these 3 products:

| Product | Monthly Price | env var |
|---------|-------------|---------|
| Starter | $19/month | `STRIPE_PRICE_STARTER_MONTHLY` |
| Pro | $49/month | `STRIPE_PRICE_PRO_MONTHLY` |
| Agency | $99/month | `STRIPE_PRICE_AGENCY_MONTHLY` |

For each, copy the **Price ID** (starts with `price_`) into the env vars.

#### Set Up Webhook

1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

For local testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

### 6. Fill in .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# YouTube / Google OAuth
YOUTUBE_CLIENT_ID=xxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-...
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_AGENCY_MONTHLY=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Change `YOUTUBE_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` to your production domain
5. Update the Stripe webhook endpoint URL to your production URL
6. Update Supabase **URL Configuration** with your production domain
7. Deploy

---

## Going Live (YouTube OAuth)

While your app is in **Testing** mode on Google, only accounts you added as test users can connect channels.

To go live:
1. Google Cloud Console → **OAuth consent screen → Publish App**
2. Fill in the verification form (Google reviews apps that request sensitive scopes)
3. YouTube scope verification can take 4–6 weeks — plan accordingly

For faster access during development, add everyone's Gmail to the **Test users** list.

---

## Database Schema

```
profiles            → user plan, AI usage, Stripe customer
youtube_channels    → connected channels, OAuth tokens, stats
comment_rules       → auto-reply rules per channel
comment_replies     → history of all AI replies sent
scheduled_videos    → video queue with status tracking
analytics_snapshots → daily performance data per channel
thumbnail_tests     → A/B test records with CTR data
```

Full schema: `supabase/migrations/001_schema.sql`

---

## Support

Open an issue on GitHub or email support@channelosapp.com.
