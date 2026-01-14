# ConversionSync - Automated Google Ads Offline Conversion Tracking

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your API keys:

#### Google OAuth & Google Ads API:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Ads API
4. Create OAuth credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Apply for Google Ads Developer Token (in Google Ads account: Tools → API Center)

#### Supabase (Database):
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API keys
4. Run the database migration (see below)

#### Stripe (Payments):
1. Go to [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys

### 3. Set Up Database

Run this SQL in your Supabase SQL editor:

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

### 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Test the Flow

1. **Sign up** for an account
2. **Connect Google Ads account** (you'll need a valid Customer ID)
3. **Upload a test conversion** (you'll need a real GCLID from a click)
4. **Check conversion history**

## Project Structure

```
conversion-sync/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── upload/            # Upload conversion page
│   └── page.js            # Homepage
├── components/            # React components
│   ├── ConnectGoogleAds.js
│   ├── UploadForm.js
│   └── ConversionHistory.js
├── lib/                   # Utilities
│   ├── googleAds.js      # Google Ads API integration
│   ├── db.js             # Supabase database helpers
│   └── utils.js          # Helper functions
└── .env.local            # Environment variables (YOU MUST CREATE THIS)
```

## Key Features

- ✅ Google Ads OAuth integration
- ✅ Offline conversion upload (with enhanced conversions)
- ✅ Automatic SHA-256 hashing
- ✅ Timezone handling
- ✅ Conversion history tracking
- ✅ Subscription management (Stripe)
- ✅ Error handling

## What's NOT Included (Add Later)

- CSV bulk upload
- Call tracking integration
- Auto GCLID capture
- CRM integrations
- Multi-client management
- Advanced analytics

## Deployment

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

## Troubleshooting

### "Developer token not approved"
- Apply for Standard Access in Google Ads API Center
- Can take 1-2 business days

### "Invalid customer ID"
- Remove dashes: use `1234567890` not `123-456-7890`
- Verify you have access to that Google Ads account

### "Conversion action not found"
- Make sure conversion action exists in Google Ads
- Check it's enabled (not removed/paused)

### Low match rates
- Add email AND phone for better matching
- Ensure data is accurate (not test data)

## Support

For issues, contact: [your email]

## License

Proprietary - All rights reserved
