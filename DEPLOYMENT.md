# Vercel Deployment Guide

This guide will help you deploy your ZOLA AI application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your environment variables ready

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

## Step 2: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

1. **GEMINI_API_KEY** - Your Google Gemini API key
2. **API_KEY** - Same as GEMINI_API_KEY (some services use this)
3. **NODE_ENV** - Set to "production" (Vercel sets this automatically)

## Step 3: Install Required Dependencies

Make sure you have the Vercel Node.js types:

```bash
npm install --save-dev @vercel/node
```

## Step 4: Build Your Project Locally (Test First)

Before deploying, test the build locally:

```bash
npm run build
```

This should create:
- `dist/client/` - Client-side assets
- `dist/server/` - Server-side code

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect the project settings
4. Add your environment variables:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Add `API_KEY` with the same value (if needed)
5. Click "Deploy"

### Option B: Deploy via CLI

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. For production deployment:
   ```bash
   vercel --prod
   ```

4. Set environment variables via CLI:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add API_KEY
   ```

## Step 6: Configure Vercel Settings

In your Vercel project settings:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist/client`
3. **Install Command**: `npm install`
4. **Node Version**: 20.x (or latest LTS)

## Step 7: Verify Deployment

After deployment:

1. Check the deployment logs for any errors
2. Visit your deployed URL
3. Test the application functionality
4. Check browser console for any client-side errors

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

### Environment Variables Not Working

- Make sure variables are set in Vercel dashboard
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### SSR Not Working

- Verify `dist/server/entry-server.js` exists after build
- Check that `api/server.ts` is properly configured
- Review Vercel function logs

### Static Assets Not Loading

- Verify `dist/client` contains all assets
- Check that asset paths are correct
- Ensure Vercel is serving static files from `dist/client`

## Important Notes

1. **Supabase Credentials**: Currently hardcoded in `services/supabase.ts`. For production, consider moving these to environment variables.

2. **API Rate Limits**: Be aware of Gemini API rate limits in production.

3. **File Uploads**: Large file uploads may need additional configuration for Vercel's serverless functions.

4. **Cold Starts**: First request after inactivity may be slower (serverless cold start).

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review function logs in Vercel dashboard
3. Test locally with `npm run build && npm run preview`

