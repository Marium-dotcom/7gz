# Appo — Doctor Booking Platform

A full-stack medical appointment booking platform built with Next.js 16, MongoDB, and Google OAuth.

## Features

- **Home Page** — Hero, About, Services, Verified Doctors, and Blog sections
- **Doctor Booking** — Browse and book appointments with verified doctors
- **User Dashboard** — View and manage your bookings
- **Doctor Profile** — Doctors can manage their profile and view their bookings
- **Admin Panel** — Manage users, doctors, bookings, blog posts, and all content sections
- **Google OAuth** — Sign in with Google via NextAuth v5
- **Role-based Access** — Roles: `user`, `doctor`, `admin`
- **Suspended Page** — Blocked users and inactive doctors are redirected

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, Server Actions
- [React 19](https://react.dev/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [NextAuth v5 (beta)](https://authjs.dev/) — Google provider
- [Tiptap](https://tiptap.dev/) — Rich text editor for blog posts
- [Tailwind CSS v4](https://tailwindcss.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd next16
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# NextAuth
AUTH_SECRET=your_random_secret_here

# Google OAuth (from Google Cloud Console)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Pusher — real-time chat (create a free app at https://pusher.com → Channels)
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

> Generate `AUTH_SECRET` with: `openssl rand -base64 32`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables Reference

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection URI (Atlas or local) |
| `AUTH_SECRET` | Random secret used to sign NextAuth session tokens |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID from Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret from Google Cloud Console |
| `PUSHER_APP_ID` | Pusher app ID (server-side only) |
| `PUSHER_SECRET` | Pusher secret key (server-side only) |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key (exposed to the browser) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region e.g. `eu`, `us2`, `ap2` |

## Project Structure

```
app/
  (admin)/admin/     # Admin panel (protected, admin role only)
  api/auth/          # NextAuth route handler
  blog/              # Public blog pages
  book/              # Doctor booking pages
  dashboard/         # User dashboard
  doctor/profile/    # Doctor profile & bookings
  profile/           # User profile
  page.tsx           # Home page
libs/
  actions/           # Server actions (hero, about, services, blog, user, doctor, booking)
  models/            # Mongoose models
  mongoose.ts        # DB connection helper
auth.ts              # NextAuth config
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
