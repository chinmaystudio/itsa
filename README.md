# ITSA PCCOE Alumni Network

An interactive, high-performance alumni web application for the **Information Technology Students' Association (ITSA)** and the **Department of Information Technology, Pimpri Chinchwad College of Engineering (PCCOE), Pune**.

- **UI/UX Design**: Inspired by [itsanp.vercel.app](https://itsanp.vercel.app/) (neo-brutalist editorial typography, continuous marquee ribbons, offset drop shadows, light/dark themes).
- **Official Data Source**: [it.pccoepune.com/alumini](https://it.pccoepune.com/alumini) (Distinguished Alumni, Felicitation Archives, Video Testimonials, AlmaConnect Portal integration, Society Registration 150/2005/Pune).

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## Deploying to Vercel via GitHub

### Option A: Via GitHub (Recommended)
1. Initialize git and push to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial ITSA PCCOE Alumni web app"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
2. Open [vercel.com](https://vercel.com/) and click **"Add New" → "Project"**.
3. Import your GitHub repository.
4. Framework preset will automatically detect **Vite** (Build Command: `npm run build`, Output Directory: `dist`).
5. Click **"Deploy"**!

### Option B: Via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to deploy directly from your machine.
