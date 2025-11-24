# CRET-Scan

CRET Tracker - Associate Resource Excellence Tracking Application

## 📁 Project Structure

The main application is in the `cret-tracker/` directory.

```
CRET-Scan/
├── cret-tracker/          ← Main application (deploy this!)
│   ├── src/
│   ├── package.json
│   └── README.md
└── vercel.json           ← Deployment configuration
```

## 🚀 Quick Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import this repository
3. **IMPORTANT:** Set the **Root Directory** to: `cret-tracker`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Option 2: Vercel CLI

```bash
cd cret-tracker
vercel --prod
```

## 📖 Full Documentation

See `cret-tracker/README.md` and `cret-tracker/SETUP.md` for complete documentation.

## ✨ Features

- Barcode scanner integration
- Real-time dashboard
- Auto-close sessions >11 hours (set to 10 hours)
- Edit session times
- CSV import/export
- Beautiful responsive UI

---

Made with ❤️ for efficient resource management
