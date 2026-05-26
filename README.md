# Instant Background Remover

A modern, AI-powered web tool to remove image backgrounds instantly — no login, no signup, no hassle.

Built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, and the **Remove.bg API**.

## Features

- Drag-and-drop image upload (JPG, PNG, WEBP)
- AI-powered background removal
- Before/after comparison slider
- Transparent PNG output
- One-click download
- Fully responsive (mobile-first)
- No authentication required
- No permanent image storage
- Smooth animations with Framer Motion
- Glassmorphism UI with gradient accents
- SEO optimized

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bg-remover.git
cd bg-remover
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a Remove.bg API key

1. Go to [remove.bg/api](https://www.remove.bg/api)
2. Sign up for a free account
3. Copy your API key

### 4. Set up environment variables

Copy the example env file and add your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
REMOVE_BG_API_KEY=your_api_key_here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── remove-bg/
│   │   │       └── route.ts          # Remove.bg API integration
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── globals.css               # Tailwind + custom styles
│   │   ├── layout.tsx                # Root layout + SEO metadata
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── AnimatedBackground.tsx     # Particle animation canvas
│   │   ├── BeforeAfter.tsx           # Comparison slider
│   │   ├── ExampleImages.tsx         # Sample image gallery
│   │   ├── FAQ.tsx                   # Accordion FAQ section
│   │   ├── HowItWorks.tsx            # 3-step guide
│   │   ├── LoadingSpinner.tsx        # Processing animation
│   │   └── UploadBox.tsx            # Drag-and-drop upload
│   └── lib/
│       └── utils.ts                  # Validation helpers
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bg-remover.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add the environment variable `REMOVE_BG_API_KEY`
4. Deploy

## API

### POST `/api/remove-bg`

Upload an image and get a transparent PNG back.

**Request:** `multipart/form-data` with field `image`

**Response:** `image/png` binary on success, or `application/json` error.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | Framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Remove.bg API | Background removal |

## License

MIT
