# 🔌 Connecting Your Supabase Database

Quick guide to connect your existing Supabase project to the CRET Tracker app.

## Step 1: Run the Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

This creates all necessary tables, triggers, and functions.

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the left menu
3. You'll see two important values:

   **Project URL:**
   ```
   https://xxxxxxxxxx.supabase.co
   ```

   **anon/public key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```

4. Copy both of these values

## Step 3: Configure the App

1. Open the file `cret-tracker/.env` (already created for you)

2. Replace the placeholder values with YOUR actual credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
   ```

   **Example:**
   ```env
   VITE_SUPABASE_URL=https://xyzabcdef123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZjEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg1NTQ5NjAwLCJleHAiOjIwMDExMjU2MDB9.some-long-signature-here
   ```

3. Save the file

## Step 4: Test Locally

```bash
cd cret-tracker
npm install  # If you haven't already
npm run dev
```

Open http://localhost:5173

Login with: `admin` / `admin123`

## Step 5: Deploy

When deploying to Vercel/Netlify, add these same environment variables in your hosting platform:

**Vercel:**
1. Project Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

**Netlify:**
1. Site Settings → Environment Variables
2. Add both variables
3. Redeploy

---

## Troubleshooting

### "Failed to fetch" or "Invalid API key"
- Check that you copied the **anon/public** key, not the **service_role** key
- Make sure there are no extra spaces in your `.env` file
- Restart the dev server after changing `.env`

### "relation does not exist" error
- You need to run the SQL schema from `supabase-schema.sql`
- Go to SQL Editor in Supabase and run the entire file

### Changes to `.env` not working
- Restart the dev server (`npm run dev`)
- Clear your browser cache
- Make sure variable names start with `VITE_`

---

## Security Notes

⚠️ **Important:**
- Never commit the `.env` file to git (it's already in `.gitignore`)
- The `anon` key is safe to use in the browser (it's public)
- Don't share your `service_role` key (never use it in the app)
- Row Level Security (RLS) policies protect your data

---

## Need Help?

Check the main [SETUP.md](SETUP.md) file for more detailed instructions and troubleshooting.
