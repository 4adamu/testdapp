# EtherLings — Next.js App

> Experiment project. Inspired by UniPeg. Not audited.

## Deploy to Vercel in 5 steps

### 1. Install dependencies
```bash
npm install
```

### 2. Paste your contract addresses
Open `.env.local` and fill in your Remix-deployed Sepolia addresses:
```
NEXT_PUBLIC_ELING=0xYourELINGAddress
NEXT_PUBLIC_SALE=0xYourSaleAddress
NEXT_PUBLIC_AIRDROP=0xYourAirdropAddress
```

### 3. Test locally first
```bash
npm run dev
```
Open http://localhost:3000 — MetaMask will work here.

### 4. Push to GitHub
```bash
git init
git add .
git commit -m "EtherLings app"
git remote add origin https://github.com/YOURNAME/etherlings-app.git
git push -u origin main
```

### 5. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. In **Environment Variables**, add the three `NEXT_PUBLIC_*` values
4. Click **Deploy**

Vercel auto-detects Next.js. No extra config needed.

## Contract addresses
Set in `.env.local` (local) and Vercel environment variables (production).
Never commit `.env.local` — it's in `.gitignore`.
