# 🎯 CRET Tracker

A beautiful, modern web application for tracking Associate CRET (Customer Resource Excellence Training) hours with barcode scanner support and real-time analytics.

![CRET Tracker](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## ✨ Features

- 🎨 **Beautiful Modern UI** - Professional interface with smooth animations and gradients
- 📊 **Real-time Dashboard** - Live statistics, active session tracking, and analytics
- 🔍 **Barcode Scanner Integration** - Support for physical USB barcode scanners + manual entry
- ⚠️ **Smart Warning System** - Automatic alerts when associates exceed 5 hours/week (overridable)
- 📈 **Historical Data** - Complete session history with advanced filtering and CSV export
- 📥 **CSV Import** - Bulk import associates with badge ID and login
- 🔐 **Authentication** - Simple username/password protection
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ☁️ **Zero-Cost Deployment** - Free hosting on Vercel/Netlify + Supabase
- ⚡ **Fast & Efficient** - Built with Vite for lightning-fast performance

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cret-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
   - Copy your Project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:5173

**Default login:** `admin` / `admin123`

---

## 📖 Documentation

See [SETUP.md](SETUP.md) for detailed setup instructions, deployment guides, and troubleshooting.

---

## 🎯 How It Works

### Workflow

1. **Scan Badge (Start)** → Associate is sent to CRET → Start time recorded
2. **Scan Badge Again (End)** → Associate returns → Hours automatically calculated
3. **Warning Check** → If >5 hours in past 7 days → Warning popup (overridable)

### Core Features

**Scanner Tab**
- Auto-detects barcode scanner input
- Manual entry fallback
- Prompts for name on first scan
- Shows last scan result

**Dashboard Tab**
- Active sessions counter
- Today's total hours
- This week's total hours
- Live session list with elapsed time
- Recent activity table

**History Tab**
- All sessions with filtering
- Search by name/login/badge
- Export to CSV
- Override indicators

**Import Tab**
- CSV template download
- Bulk associate import
- Preview before importing
- Duplicate handling (upsert)

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5
- **Styling:** Tailwind CSS 3
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel / Netlify
- **Utilities:**
  - `@supabase/supabase-js` - Database client
  - `date-fns` - Date manipulation
  - `react-hot-toast` - Notifications

---

## 📦 Project Structure

```
cret-tracker/
├── src/
│   ├── components/         # React components
│   │   ├── Login.jsx       # Authentication
│   │   ├── Scanner.jsx     # Barcode scanning & manual entry
│   │   ├── Dashboard.jsx   # Analytics & stats
│   │   ├── History.jsx     # Session history
│   │   ├── CSVImport.jsx   # Bulk import
│   │   ├── WarningModal.jsx
│   │   └── NamePromptModal.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx # Authentication state
│   ├── lib/
│   │   └── supabase.js     # Supabase client
│   ├── utils/
│   │   └── cretUtils.js    # Database operations
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── supabase-schema.sql     # Database schema
├── sample-associates.csv   # Example CSV
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

---

## 🔧 Configuration

### Changing Warning Threshold

Edit `src/utils/cretUtils.js`, line ~123:
```javascript
if (totalHours >= 5) {  // Change to your desired threshold
```

### Adding Users

Run in Supabase SQL Editor:
```sql
INSERT INTO users (username, password_hash, full_name)
VALUES ('username', 'password', 'Full Name');
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

See [SETUP.md](SETUP.md) for detailed deployment instructions.

---

## 📱 Screenshots

### Scanner Interface
Beautiful, intuitive scanning interface with barcode support

### Dashboard
Real-time analytics and active session tracking

### History View
Comprehensive session history with filtering and export

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your organization!

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for efficient resource management.

---

**Questions? Issues?** Check [SETUP.md](SETUP.md) for troubleshooting or open an issue on GitHub.

---

Made with ❤️ for better workforce management
