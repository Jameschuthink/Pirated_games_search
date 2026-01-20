# Railway Deployment Guide

## Simple Setup

Your application is already configured for Railway! Here's what you need to know:

### What Railway Provides Automatically
- **PORT**: Railway automatically sets `PORT=8080`
- **Environment**: Railway sets `RAILWAY_ENVIRONMENT` variable
- **Host**: Your app automatically binds to `0.0.0.0` when Railway is detected

### What You Need to Do

1. **Deploy to Railway**:
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the Dockerfile
   - No additional configuration needed!

2. **Environment Variables**:
   - Railway will automatically set `PORT=8080`
   - Add any other required env vars in Railway dashboard

### Key Files
- **Dockerfile**: Already configured with `ENV PORT=8080`
- **src/index.ts**: Automatically detects Railway and uses `0.0.0.0`
- **src/common/utils/envConfig.ts**: Simple Railway detection logic

### Testing Locally
To test Railway-like environment locally:
```bash
PORT=8080 RAILWAY_ENVIRONMENT=production pnpm start:prod
```

Your app will automatically:
- Use port 8080
- Bind to 0.0.0.0
- Show "🚄 Railway deployment detected" in logs

That's it! Simple and ready to deploy. 🚄