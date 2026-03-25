# Parivar Mart - E-Commerce Website

## Deployment Instructions

### Option 1: Deploy to Vercel (Free)

1. **Create a GitHub Repository:**
   - Go to [GitHub](https://github.com)
   - Create a new repository
   - Push your code to GitHub:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/parivar-mart.git
     git push -u origin main
     ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Deploy"

### Option 2: Deploy using Vercel CLI

```bash
npm i -g vercel
vercel login
cd your-project-folder
vercel --prod
```

## Admin Credentials
- URL: `/admin-login`
- Username: `store_admin`
- Password: `Store@2026`

## Features
- User registration and login
- Product browsing by category
- Shopping cart
- Order placement
- Admin dashboard for managing products and orders