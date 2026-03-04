# Deploy Backend to Render

## Quick Deploy Steps

1. **Commit your changes:**
```bash
cd Taekwondo_backend
git add .
git commit -m "Fix student profile endpoint - add email fallback and better error handling"
```

2. **Push to your repository:**
```bash
git push origin main
```
(Replace `main` with your branch name if different)

3. **Render will auto-deploy** if you have auto-deploy enabled
   - Or go to your Render dashboard
   - Select your backend service
   - Click "Manual Deploy" → "Deploy latest commit"

## What Was Fixed

The `/api/students/profile` endpoint now:
- Checks if the authenticated user is already a Student object
- Falls back to finding by ID
- Falls back to finding by email (handles Login model vs Student model mismatch)
- Provides detailed debugging information
- Ensures the `name` field is set for mobile app compatibility

## Testing After Deploy

Once deployed, the mobile app should successfully load the student profile.

The logs will show:
```
👤 Student profile request
🆔 User from token: { id: ..., email: ..., role: ... }
✅ Student profile found: [Student Name]
```

Instead of:
```
❌ Student not found
```
