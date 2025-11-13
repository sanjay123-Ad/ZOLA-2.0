# Quick Vercel Deployment Checklist

## Before You Deploy

1. ✅ **Test Build Locally**
   ```bash
   npm install
   npm run build
   ```
   Make sure this completes without errors.

2. ✅ **Push to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

## Deploy Steps

### Method 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - `GEMINI_API_KEY` = (your API key)
   - `API_KEY` = (same as GEMINI_API_KEY)
6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add API_KEY

# Deploy to production
vercel --prod
```

## After Deployment

1. Visit your deployment URL
2. Test the application
3. Check Vercel dashboard for any errors
4. Monitor function logs if issues occur

## Common Issues

- **Build fails**: Check Node.js version (should be 20.x)
- **404 errors**: Verify `vercel.json` configuration
- **API errors**: Check environment variables are set correctly
- **SSR not working**: Check `dist/server/` exists after build

## Need Help?

Check the full guide in `DEPLOYMENT.md`

