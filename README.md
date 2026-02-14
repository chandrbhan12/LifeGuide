# 🚀 LifeGuide AI Deployment Guide

Aapka LifeGuide AI assistant deploy hone ke liye taiyaar hai!

## Steps to Deploy:

### 1. Vercel (Recommended)
1. In saari files ko GitHub par push karein.
2. [Vercel](https://vercel.com) par login karein aur "Add New Project" select karein.
3. GitHub repository connect karein.
4. **Environment Variables** section mein:
   - Key: `API_KEY`
   - Value: `Aapki_Gemini_API_Key_Yahan_Dalein`
5. "Deploy" par click karein.

### 2. Netlify
1. GitHub repo connect karein [Netlify](https://netlify.com) par.
2. Build Settings ko default rehne dein (kyunki yeh module-based app hai).
3. **Environment Variables** (Site Configuration > Environment variables) mein `API_KEY` set karein.
4. "Deploy site" par click karein.

### ⚠️ Important Note:
AI features ke kaam karne ke liye `API_KEY` ka hona zaroori hai. Bina API Key ke "Link Compromised" error dikhayi dega.