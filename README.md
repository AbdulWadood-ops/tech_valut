# TechVerse — Device Specifications, Comparisons & Community Hub

TechVerse is a modern, responsive, high-performance web platform for exploring tech device specifications, side-by-side device comparisons, interactive community reviews, tech news feeds, and user forums across Smartphones, Tablets, Smartwatches, Earbuds, and Laptops.

---

## 🚀 Features

- **Multi-Category Catalog**: Browse phones, tablets, smartwatches, earbuds, and laptops with category-aware spec grids (processors, displays, batteries, drivers, cameras, and storage).
- **Responsive Layout**: Designed for mobile, tablet, and desktop screens with sticky 1-tap category bars, adaptive sidebars, and accessible touch targets.
- **Side-by-Side Comparison**: Compare specs and performance benchmarks across devices with intuitive difference highlighting.
- **Community Reviews & Discussions**: Interactive 5-star rating matrix with hover animations, rating distribution bars, and real-time MongoDB synchronization (`device_comments` and `user_reviews`).
- **Tech News & Forum**: Automated RSS news ingestion for tech launches and community discussion boards.
- **High-Speed In-Memory Cache**: Built-in zero-dependency memory cache with sub-millisecond retrieval and automated TTL invalidation.
- **Resilient Fallback Architecture**: Seamlessly serves from bundled offline datasets if database connections are temporarily unavailable.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver 7.5)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- (Optional) Local MongoDB or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tech-specs-hub.git
   cd tech-specs-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your MongoDB Atlas URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/appdb?retryWrites=true&w=majority
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   *(Note: The app runs with built-in dataset fallback even without a MongoDB connection!)*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🚢 Deploying to Vercel

This repository is pre-configured for one-click deployment on [Vercel](https://vercel.com/):

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production ready for Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Vercel will automatically detect the **Next.js** framework preset.

3. **Set Environment Variables**:
   In the Vercel project settings, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NEXT_PUBLIC_APP_URL`: Your deployed Vercel domain (e.g., `https://your-app.vercel.app`).

4. **Deploy**:
   - Click **Deploy**. Vercel will build and launch your application globally on their Edge network.
   - Daily news fetch cron is automatically registered via `vercel.json`.

---

## 📁 Project Structure

```
├── public/                 # Static public assets (icons, brand logos)
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/            # Serverless endpoints (comments, news, ranking, health)
│   │   ├── brand/[brand]/  # Brand device catalog
│   │   ├── compare/        # Device comparison page
│   │   ├── device/[id]/    # Detailed device specifications page
│   │   ├── devices/        # Paginated device browser with filters
│   │   ├── forum/          # Community discussion topics
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable UI components (Header, Footer, DeviceCard, etc.)
│   ├── data/               # Bundled datasets (130+ brand catalogs, devices, reviews)
│   └── lib/                # Database connection, cache layer, and ranking algorithms
├── vercel.json             # Vercel deployment and cron jobs configuration
└── next.config.mjs         # Next.js compiler, image domains, and headers configuration
```

---

## 🔒 Security & Best Practices

- Real database credentials are kept in `.env` and are strictly excluded from git via `.gitignore`.
- Built-in circuit breaker pattern prevents cascading timeouts on cold starts or network latency.
- Strict HTTP security headers configured in `next.config.mjs` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 📄 License

This project is licensed under the MIT License.
