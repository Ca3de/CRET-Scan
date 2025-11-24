# CRET Tracker Setup Guide

A beautiful, modern application for tracking Associate CRET (Customer Resource Excellence Training) hours with barcode scanner support.

## Features

✨ **Beautiful UI** - Modern, professional interface with smooth animations
📊 **Real-time Dashboard** - Live stats and active session tracking
⚠️ **Smart Warnings** - Automatic alerts when associates exceed 5 hours/week
🔍 **Barcode Scanner Support** - Physical scanner integration + manual entry
📈 **Historical Data** - Complete session history with filtering and export
📥 **CSV Import** - Bulk import associates from CSV files
🔐 **Authentication** - Simple username/password protection
☁️ **Zero-Cost Deployment** - Free hosting on Vercel + Supabase

---

## Quick Start (5 minutes)

### Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to initialize (~2 minutes)
4. Go to **SQL Editor** (left sidebar)
5. Click **New Query** and paste the contents of `supabase-schema.sql`
6. Click **Run** to create all tables and functions

### Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 3: Configure Environment Variables

1. Create a file named `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## Deployment (Vercel - Recommended)

### Option A: Deploy with Vercel (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Import Project** → Select your repository
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

Done! Your app is live at `https://your-app.vercel.app`

### Option B: Deploy with Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click **New site from Git** → Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add Environment Variables (same as above)
6. Click **Deploy**

---

## Importing Associates

### Method 1: CSV Upload (Recommended)

1. Go to the **Import** tab in the app
2. Download the CSV template
3. Fill in your associate data:
   ```csv
   badge_id,login,name
   12345,jdoe,John Doe
   67890,asmith,Alice Smith
   ```
4. Upload the CSV file
5. Review the preview and click **Import**

### Method 2: Auto-Create on First Scan

1. Go to the **Scanner** tab
2. Scan an unknown badge or enter a login
3. The app will prompt you to enter the associate's name
4. The associate is automatically created!

---

## Using the App

### Scanning Associates

**Physical Barcode Scanner:**
1. Keep the Scanner tab open
2. Scanner input is always focused
3. Scan a badge → Auto-submits after detecting rapid input
4. System automatically determines if starting or ending a CRET session

**Manual Entry:**
1. Type the badge ID or login
2. Press Enter or click Submit
3. Same logic applies!

**Workflow:**
```
First Scan  → "Send to CRET" (records start time)
Second Scan → "Return from CRET" (calculates hours)
```

### 5-Hour Warning System

When an associate has used ≥5 hours of CRET in the past 7 days:
- ⚠️ Warning popup appears
- Shows total hours used
- Can be overridden with a reason
- Override reason is logged for accountability

### Dashboard

- **Active Now:** Associates currently in CRET
- **Today's Total:** Hours used today
- **This Week:** Hours used in past 7 days
- **Live Sessions:** See who's in CRET right now
- **Recent Activity:** Last 10 sessions
- Auto-refreshes every 30 seconds

### History

- View all past sessions
- Filter by status (All/Completed/Active)
- Search by name, login, or badge ID
- Export to CSV for reporting
- Shows override warnings

---

## Barcode Scanner Setup

### Recommended Scanners

Any USB barcode scanner that acts as a keyboard will work!

**Budget Options ($20-50):**
- NADAMOO Wireless Barcode Scanner
- Tera Wireless Barcode Scanner
- Inateck Barcode Scanner

**How to Configure:**
1. Plug in the scanner (USB or wireless receiver)
2. Scanner acts like a keyboard - types badge numbers
3. No drivers needed!
4. Keep the Scanner tab focused
5. Scan badges - they auto-submit

**Scanner Settings:**
- Set suffix to "Enter" (most scanners default to this)
- No prefix needed
- Code format: Any alphanumeric format works

---

## Customization

### Changing the 5-Hour Threshold

Edit `src/utils/cretUtils.js`:
```javascript
// Line ~123
if (totalHours >= 5) {  // Change 5 to your desired threshold
```

### Changing the Week Definition

The app uses "past 7 days" by default. To change to calendar weeks, edit:
```javascript
// src/utils/cretUtils.js - getCretHoursLastWeek function
const sevenDaysAgo = subDays(new Date(), 7);  // Modify this
```

### Adding More User Accounts

Run this in Supabase SQL Editor:
```sql
INSERT INTO users (username, password_hash, full_name)
VALUES ('newuser', 'password123', 'Full Name');
```

⚠️ **Note:** This is a simple auth system for internal use. For production with many users, implement proper password hashing!

---

## Database Schema

### Tables

**associates**
- `id` - UUID primary key
- `badge_id` - Unique badge identifier
- `login` - Username/login
- `name` - Full name (optional, can be added later)

**cret_sessions**
- `id` - UUID primary key
- `associate_id` - Foreign key to associates
- `start_time` - When sent to CRET
- `end_time` - When returned (null if active)
- `hours_used` - Auto-calculated duration
- `day_of_week` - Day name (Monday, Tuesday, etc.)
- `week_start` - Start date of the week
- `override_warning` - Boolean flag
- `override_reason` - Text explanation
- `created_by` - Username who created the session

**users**
- `id` - UUID primary key
- `username` - Login username
- `password_hash` - Password (simple for demo)
- `full_name` - Display name

---

## Troubleshooting

### "No rows returned" error
- Make sure you ran the SQL schema in Supabase
- Check that environment variables are set correctly

### Scanner not working
- Keep the Scanner tab focused
- Make sure scanner is in "keyboard mode"
- Test scanner in a text editor first
- Check that scanner suffix is set to "Enter"

### Can't login
- Default credentials: `admin` / `admin123`
- Check that the users table was created
- Verify Supabase connection

### Slow performance
- Supabase free tier may pause after inactivity
- First request after pause takes ~1-2 seconds
- Consider upgrading Supabase plan for production

### Build errors
- Make sure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Hosting:** Vercel / Netlify
- **Utilities:** date-fns, react-hot-toast

---

## Security Notes

⚠️ **Important for Production Use:**

1. **Password Security:** The current auth system uses simple password comparison for demo purposes. For production:
   - Implement proper bcrypt password hashing
   - Or use Supabase Auth (built-in authentication)

2. **Row Level Security:** RLS is enabled but set to allow all authenticated users. Customize policies for your needs.

3. **Environment Variables:** Never commit `.env` files. Always use environment variables in your hosting platform.

4. **HTTPS:** Vercel and Netlify automatically provide HTTPS. Never deploy without SSL.

---

## Support & Feedback

Need help? Have suggestions?
- Check the troubleshooting section above
- Review the code comments for implementation details
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)

---

## License

MIT - Feel free to use this for your team!

Built with ❤️ for efficient resource management
