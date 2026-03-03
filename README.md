# PhotoShare - Modern Social Feed 📸

A high-performance, aesthetically pleasing social photo feed built with the latest web technologies. Share your moments, comment on posts, and manage your content with a seamless user experience.

## ✨ Features

- **Google OAuth**: Fast and secure authentication using Google Sign-In.
- **Dynamic Photo Feed**: Smoothly loading grid of photos with fixed-height cards for a clean layout.
- **Multi-Image Uploads**: Upload multiple photos per post with horizontal previews and drag-to-scroll.
- **Interactive Overlays**: View photos in a beautiful modal with full-screen carousels and real-time comments.
- **Content Management**: Users can edit their captions, add/remove photos from existing posts, or delete posts entirely.
- **Optimistic UI**: Comments and post updates reflect instantly without full-page reloads.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Ant Design (AntD)](https://ant.design/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/) (High-speed image hosting)
- **Auth**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd test-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="your_neon_db_url"

# AWS S3 Configuration
AWS_S3_ACCESS_KEY_ID="your_access_key"
AWS_S3_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_REGION="your_region"
AWS_S3_BUCKET_NAME="your_bucket_name"

# Authentication (Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
```

### 3. Database Setup

Synchronize your Prisma schema with your Neon database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `/app`: Next.js 15 App Router (Routes & API)
- `/components`: Reusable UI components (PhotoCard, UploadForm, etc.)
- `/context`: Application state (Auth, MainPage, CreatePost contexts)
- `/lib`: Library initializations (Prisma client)
- `/prisma`: Schema definition and migrations
- `/utils`: Helper functions (S3 uploader, etc.)

## 📝 License

Distributed under the MIT License.
