# Deploy Backend Updates to Render.com

## Problem
The admin panel at `https://taekwon-frontend.onrender.com` is getting 404 errors because the backend code changes haven't been deployed yet.

## Solution: Deploy to Render

### Option 1: Git Push (Automatic Deploy)

1. **Commit your changes:**
```bash
cd reactnative/Taekwondo_backend
git add .
git commit -m "Fix certificate statistics endpoint - add examiner field"
git push origin main
```

2. **Render will auto-deploy** (if auto-deploy is enabled)
   - Check Render dashboard: https://dashboard.render.com
   - Wait 2-5 minutes for deployment

### Option 2: Manual Deploy via Render Dashboard

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete

### Option 3: Deploy Specific Branch

```bash
git push render main:main
```

## Verify Deployment

### 1. Check Health Endpoint
```bash
curl https://taekwon-frontend.onrender.com/api/health
```

### 2. Test Statistics Endpoint
```bash
curl https://taekwon-frontend.onrender.com/api/certificates/statistics
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "totalCertificates": 156,
    "activeCertificates": 148,
    "recentCertificates": [
      {
        "id": "CERT-4125362",
        "student": "Golu Vishwakarma",
        "examiner": "Master Instructor",
        ...
      }
    ]
  }
}
```

### 3. Test Admin Panel
1. Open: https://taekwon-frontend.onrender.com
2. Navigate to Certificates section
3. Should load without errors

## Troubleshooting

### If 404 persists:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your service
   - View "Logs" tab
   - Look for startup errors

2. **Verify server.js is running:**
   - Check if `app.get('/api/certificates/statistics')` is registered
   - Look for "Server running on port..." message

3. **Check Environment Variables:**
   - Ensure all required env vars are set in Render
   - PORT, MONGODB_URI, JWT_SECRET, etc.

4. **Restart Service:**
   - In Render dashboard, click "Manual Deploy"
   - Or use "Restart" button

## Important Notes

- **Backend URL**: `https://taekwon-frontend.onrender.com/api`
- **Frontend URL**: `https://taekwon-frontend.onrender.com`
- Both are on the same domain (Render service)
- Changes must be deployed to Render to take effect
- Local changes won't affect the live site

## Quick Deploy Command

```bash
# From project root
cd reactnative/Taekwondo_backend
git add .
git commit -m "Fix certificate endpoints"
git push origin main
```

Then wait 2-5 minutes and test the admin panel!
