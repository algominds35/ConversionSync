# ConversionSync - Complete Setup Guide

## 🚀 Quick Start (30 Minutes)

### Step 1: Clone and Install (5 min)

```bash
# Navigate to your project folder
cd "C:\Users\mrjoj\google ads"

# Install dependencies
npm install
```

### Step 2: Create `.env.local` File (10 min)

Create a file called `.env.local` in the root directory with these variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth & Google Ads API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 📋 Get Your API Keys

### 1. Google Cloud Console (OAuth + Google Ads API)

**A. Create Project:**
1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "ConversionSync"
4. Click "Create"

**B. Enable Google Ads API:**
1. In your project, go to: "APIs & Services" → "Library"
2. Search: "Google Ads API"
3. Click it → Click "Enable"

**C. Create OAuth Credentials:**
1. Go to: "APIs & Services" → "Credentials"
2. Click "Configure Consent Screen"
   - User Type: External
   - App name: ConversionSync
   - User support email: your@email.com
   - Developer contact: your@email.com
   - Click "Save and Continue"
   - Scopes: Click "Save and Continue" (skip for now)
   - Test users: Add your email
   - Click "Save and Continue"

3. Go back to "Credentials" → Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: ConversionSync Web Client
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

4. **COPY THESE:**
   - Client ID → Put in `GOOGLE_CLIENT_ID`
   - Client secret → Put in `GOOGLE_CLIENT_SECRET`

**D. Get Developer Token:**
1. Go to: https://ads.google.com/
2. Sign in to your Google Ads account
3. Click Tools icon (wrench) → "API Center" (under Setup)
4. Click "Apply for API access" or "View my API Token"
5. Fill out form if needed
6. **COPY the developer token** → Put in `GOOGLE_ADS_DEVELOPER_TOKEN`

**Note:** Developer token approval can take 1-2 business days. You can still build while waiting!

---

### 2. Supabase (Database)

**A. Create Project:**
1. Go to: https://supabase.com/
2. Sign up / Sign in
3. Click "New Project"
   - Name: ConversionSync
   - Database Password: (save this somewhere)
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

**B. Get API Keys:**
1. In your project, click "Settings" (gear icon) → "API"
2. **COPY THESE:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

**C. Create Database Tables:**
1. In Supabase, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Paste this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_ads_customer_id TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  selected_conversion_action TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversions table
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gclid TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  conversion_date TIMESTAMP NOT NULL,
  conversion_value DECIMAL(10,2) NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  upload_status TEXT NOT NULL CHECK (upload_status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  google_ads_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX idx_conversions_upload_status ON conversions(upload_status);
```

4. Click "Run" (bottom right)
5. Should see "Success. No rows returned"

---

### 3. Stripe (Payments) - OPTIONAL FOR MVP

**Can skip this for now and add later!**

1. Go to: https://stripe.com/
2. Sign up / Sign in
3. Click "Developers" → "API keys"
4. **COPY THESE:**
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. For webhook secret (later): Use Stripe CLI or webhook dashboard

---

### 4. NextAuth Secret

Generate a random secret:

```bash
# Run this in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output → `NEXTAUTH_SECRET`

---

## ✅ Your `.env.local` Should Look Like:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz789randomstringhere==

GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
GOOGLE_ADS_DEVELOPER_TOKEN=abc123xyz789

NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_SECRET_KEY=sk_test_abc123
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xyz789
STRIPE_WEBHOOK_SECRET=whsec_abc123
```

---

## 🏃‍♂️ Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Test the Full Flow

### 1. Create Account
- Go to: http://localhost:3000
- Click "Start Free Trial"
- Enter email and password
- Click "Create Account"

### 2. Sign In
- Sign in with your credentials

### 3. Connect Google Ads
- Click "Connect Google Ads Account"
- Enter your Google Ads Customer ID (format: 123-456-7890)
  - Find this in Google Ads → top right corner
- Click "Connect"
- Authorize with Google

### 4. Upload Test Conversion
- Click "Upload Conversion"
- Enter:
  - GCLID: Get one by clicking a Google ad and copying from URL
  - Email: test@example.com
  - Conversion date/time: Now
  - Value: 100
- Click "Upload"

### 5. Check Results
- Should see "Success" message
- Go to "View History"
- Should see your conversion
- Check in Google Ads: Tools → Conversions → See if it appears

---

## 🐛 Troubleshooting

### "Developer token not approved"
- **Solution:** Wait 1-2 business days for approval, or use test account

### "Invalid customer ID"
- **Solution:** Remove dashes: use `1234567890` not `123-456-7890`

### "Failed to fetch conversion actions"
- **Solution:** Make sure you have conversion tracking set up in Google Ads

### Database errors
- **Solution:** Make sure you ran the SQL to create tables

### OAuth errors
- **Solution:** Check redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`

---

## 📦 What's Included

✅ Complete authentication (sign up, sign in)
✅ Google Ads OAuth connection
✅ Offline conversion upload form
✅ Automatic hashing (SHA-256)
✅ Timezone handling
✅ Conversion history
✅ Dashboard with stats
✅ Error handling

## 🚫 What's NOT Included (Add Later)

❌ CSV bulk upload
❌ Stripe subscription management
❌ Call tracking integration
❌ Multi-client dashboard
❌ Advanced analytics

---

## 🎯 Next Steps After Setup

1. **Test with real data** - Upload a real conversion and verify in Google Ads
2. **Deploy to Vercel** - `npm i -g vercel && vercel`
3. **Add Stripe** - Integrate payments
4. **Validate with Reddit users** - Get feedback

---

Need help? Check the README.md or create an issue.

Good luck! 🚀
