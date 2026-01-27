# Wallinst - AI-Powered Instagram Engagement Intelligence

> Transform Instagram engagement into qualified B2B leads with AI-powered analytics.

---

## 🎯 Project Overview

**Wallinst** is a premium B2B SaaS platform that analyzes Instagram engagement using AI to identify and score qualified leads. The platform connects via Instagram Graph API, scores every user interaction, and helps businesses focus on high-intent prospects.

### Key Features

- 🤖 **AI Intent Scoring**: Every engager gets a 0-100 score based on purchase intent
- 📊 **Real-Time Analytics**: Live dashboard with engagement trends and insights
- 🎯 **Lead Qualification**: Automatically categorize users as high, medium, or low intent
- 💬 **Smart Replies**: AI-suggested responses to high-intent comments
- 📈 **CRM Integration**: Export leads to HubSpot, Salesforce, and more
- 🔔 **Smart Notifications**: Real-time alerts for high-value opportunities

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React/TS      │  ← Frontend (This Repo)
│   + Tailwind    │     - JWT Auth
│   + Hooks       │     - API Integration
└────────┬────────┘     - Real-time UI
         │
         ↓ HTTP/REST
         │
┌────────┴────────┐
│   Backend API   │  ← Python/Node Backend
│   (Port 8000)   │     - PostgreSQL
│                 │     - Redis Queue
└────────┬────────┘     - AI Analysis
         │
         ↓
┌─────────────────┐
│  External APIs  │
│  - Instagram    │
│  - OpenAI       │
│  - SendGrid     │
└─────────────────┘
```

---

## 📁 Repository Structure

```
/
├── lib/                    # Core infrastructure
│   ├── api.ts             # API client with auto-refresh
│   ├── auth.ts            # Token storage
│   └── types.ts           # TypeScript types
│
├── hooks/                  # React hooks for data fetching
│   ├── useAuth.ts
│   ├── useEngagers.ts
│   ├── useNotifications.ts
│   └── useDashboard.ts
│
├── context/
│   └── AuthContext.tsx    # Global auth state
│
├── components/             # React components
│   ├── SignIn.tsx         # ✅ API integrated
│   ├── Dashboard.tsx      # ✅ API integrated
│   ├── Settings.tsx       # ✅ API integrated
│   └── ... (landing page components)
│
├── styles/
│   └── globals.css
│
├── App.tsx                # Main app entry
│
├── BACKEND_SPECIFICATION.md      # Complete backend API spec
├── FRONTEND_SETUP.md            # Setup instructions
├── API_INTEGRATION_SUMMARY.md   # Integration overview
├── API_QUICK_REFERENCE.md       # API endpoint reference
└── IMPLEMENTATION_CHECKLIST.md  # Development checklist
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wallinst.git
cd wallinst

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) | Complete frontend setup guide |
| [BACKEND_SPECIFICATION.md](./BACKEND_SPECIFICATION.md) | Backend API specification |
| [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) | Quick API endpoint reference |
| [API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md) | How frontend connects to backend |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Development checklist |

---

## 🔐 Authentication

### JWT-Based Auth

1. User logs in → receives `accessToken` + `refreshToken`
2. Tokens stored in `localStorage`
3. Every API request includes `Authorization: Bearer <accessToken>`
4. Access token expires in 15 minutes
5. Frontend automatically refreshes token using refresh token
6. If refresh fails → user logged out

### Token Storage

```javascript
localStorage.getItem('wallinst_access_token')
localStorage.getItem('wallinst_refresh_token')
```

---

## 🎨 UI/UX Design

### Design System

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Colors**: Indigo/Purple gradients (enterprise B2B aesthetic)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Design Inspiration**: Stripe, Linear, Notion

### Key Components

- **Landing Page**: Hero, features, social proof, pricing, FAQ
- **Dashboard**: KPIs, charts, engagers table, notifications
- **Settings**: Account, notifications, integrations, security, billing
- **Sign In**: Clean authentication form with error handling

---

## 📊 Data Flow

### Example: Dashboard Loading

```
1. User visits /dashboard
   ↓
2. useAuth() checks for tokens in localStorage
   ↓
3. If authenticated → render Dashboard
   ↓
4. Dashboard calls hooks:
   - useEngagers() → GET /api/engagers
   - useNotifications() → GET /api/notifications
   - useDashboard() → GET /api/dashboard/kpis
   ↓
5. Hooks update component state
   ↓
6. UI renders with real data
```

### Example: Token Refresh

```
1. User makes API call after 16 minutes
   ↓
2. Access token expired → 401 Unauthorized
   ↓
3. api.ts detects 401
   ↓
4. Automatically calls POST /api/auth/refresh
   ↓
5. New tokens received and stored
   ↓
6. Original request retried with new token
   ↓
7. Success! User never noticed anything
```

---

## 🛠️ Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development
```

For production:

```bash
VITE_API_URL=https://api.wallinst.com
VITE_APP_ENV=production
```

---

## 🔌 API Integration

### Making API Calls

All API endpoints are pre-configured in `/lib/api.ts`:

```typescript
import { api } from './lib/api';

// Login
const { user, accessToken, refreshToken } = await api.login(email, password);

// Get engagers
const { engagers, pagination } = await api.getEngagers({ 
  page: 1, 
  limit: 20, 
  intentLabel: 'High' 
});

// Get notifications
const { notifications, unreadCount } = await api.getNotifications();

// Connect Instagram
await api.connectInstagram(code, state);
```

### Using Hooks

```typescript
import { useEngagers } from './lib/hooks';

function MyComponent() {
  const { engagers, isLoading, error } = useEngagers({
    page: 1,
    limit: 20,
    intentLabel: 'High'
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <EngagersList engagers={engagers} />;
}
```

---

## 🧪 Testing

### Manual Testing

1. **Test Login**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. **Test Engagers Endpoint**:
   ```bash
   curl -X GET "http://localhost:8000/api/engagers" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check Browser**:
   - Open DevTools → Network tab
   - Monitor all API calls
   - Verify responses

### Frontend Testing Checklist

- [ ] User can register new account
- [ ] User can log in with credentials
- [ ] Dashboard loads real data
- [ ] Notifications appear
- [ ] Instagram connect flow works
- [ ] Token auto-refreshes
- [ ] Logout clears data
- [ ] Error messages display
- [ ] Loading states show

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build production bundle
npm run build

# Output in /dist folder
# Deploy /dist to Vercel, Netlify, etc.
```

### Environment Setup

**Vercel**:
1. Connect GitHub repo
2. Set environment variable: `VITE_API_URL=https://api.wallinst.com`
3. Deploy

**Netlify**:
1. Connect repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: `VITE_API_URL=https://api.wallinst.com`

---

## 🔒 Security

### Best Practices

- ✅ Tokens stored in localStorage (not cookies for this SPA)
- ✅ JWT with short expiration (15 min access, 7 day refresh)
- ✅ Automatic token refresh
- ✅ HTTPS in production
- ✅ Input validation on backend
- ✅ CORS properly configured
- ✅ Rate limiting enforced

### What NOT to Store in Frontend

- ❌ API secrets
- ❌ Database credentials
- ❌ Instagram app secret
- ❌ OpenAI API key

All secrets stay on backend!

---

## 📈 Performance

### Optimizations

- Lazy loading for routes (future)
- Image optimization with next/image equivalent
- API response caching (future: React Query)
- Code splitting
- Minified production bundle

### Metrics

- Initial load: < 3s
- Time to interactive: < 2s
- Lighthouse score: > 90

---

## 🐛 Troubleshooting

### "API connection refused"

**Solution**: Make sure backend is running on `http://localhost:8000`

```bash
curl http://localhost:8000/health
```

### "Invalid token" error

**Solution**: Clear localStorage and log in again

```javascript
localStorage.clear();
```

### "CORS error"

**Solution**: Backend must allow your frontend origin in CORS settings

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🔗 Links

- [Backend Specification](./BACKEND_SPECIFICATION.md)
- [Frontend Setup Guide](./FRONTEND_SETUP.md)
- [API Reference](./API_QUICK_REFERENCE.md)
- [Live Demo](#) (Coming soon)
- [Documentation](#) (Coming soon)

---

## 📞 Support

- **Email**: support@wallinst.com
- **Documentation**: docs.wallinst.com
- **Status Page**: status.wallinst.com

---

## ✨ Acknowledgments

- Design inspiration: Stripe, Linear, Notion
- Icons: Lucide React
- Charts: Recharts
- UI Framework: Tailwind CSS

---

**Built with ❤️ by the Wallinst Team**
