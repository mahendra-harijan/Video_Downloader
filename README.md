# CloudDrop — Video Downloader

CloudDrop is a modern, fast, and secure media downloading application built with Next.js. It allows users to paste a URL from supported platforms, analyze the available formats, and securely download the media directly to their device.

## Features

- **Modern Architecture**: Full-stack Next.js application using App Router.
- **Premium UI/UX**: Built with Tailwind CSS, shadcn/ui, and Radix primitives.
- **Robust Media Extraction**: Powered by `yt-dlp` (via `youtube-dl-exec`) for extracting media formats and streaming downloads.
- **Stream Downloads**: Media is piped directly to the user's browser, preventing the server from running out of disk space.
- **Dark Mode**: Fully responsive, with first-class Dark and Light mode themes.
- **Type-safe API**: Zod validation for all API inputs.

## Technologies Used

- **Frontend**: React 18, Next.js 14, Tailwind CSS, shadcn/ui, Lucide React, Sonner (for toast notifications).
- **Backend API**: Next.js Route Handlers, Node.js Streams.
- **Media Engine**: `youtube-dl-exec` (yt-dlp).
- **Validation**: Zod.

## Project Structure

```
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # API Endpoints (analyze, download)
│   ├── globals.css       # Tailwind configuration and CSS variables
│   ├── layout.tsx        # Root layout wrapper
│   └── page.tsx          # Main landing page
├── components/           # Reusable UI components
│   ├── analyzer/         # Core application components (UrlInput, MediaCard, FormatTable)
│   ├── home/             # Home page specific components (FAQ)
│   ├── layout/           # App layout components (Header, Footer)
│   └── ui/               # shadcn/ui generic primitives
├── lib/                  # Helper utilities (format duration, bytes)
└── types/                # TypeScript interface definitions
```

## Local Development Setup

### Requirements

- Node.js 18.17 or later
- npm or pnpm or yarn
- `yt-dlp` binary (will be automatically downloaded by `youtube-dl-exec` upon install in most cases, but you can also install it globally if needed).

### Installation

1. **Clone or Extract the Project**
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Environment Variables**
   Create a `.env.local` file at the root of the project.
   Currently, the application runs without custom environment variables, but you can add rate-limiting limits and domain whitelists if deployed to production.
   ```bash
   # .env.local
   # MAX_DOWNLOAD_SIZE_MB=500
   ```

### Running the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm run start
```

## Production Deployment

This application heavily utilizes Next.js API Routes running on Node.js to spawn `yt-dlp` child processes and stream binary data.

- Ensure your hosting provider supports **Node.js runtimes** (Serverless functions or long-running processes).
- *Vercel Note*: Serverless function timeouts on the free Vercel plan are limited to 10 seconds. Downloading large files may timeout. If deploying on Vercel, consider upgrading to Pro, or deploy on a traditional VPS (DigitalOcean, AWS, Railway, Render) using a Docker container or Node.js server.
- The backend API utilizes `child_process.spawn`. This might be restricted in some strict serverless environments.

## Legal & Content Rights

This application is built for legitimate media conversion and extraction for content the user owns or has explicitly been given the rights to save. 

**CloudDrop is NOT designed to:**
- Bypass DRM (Digital Rights Management)
- Download private, unauthorized content
- Circumvent paywalls

Always respect the terms of service of the content provider and the copyright of the creators.
