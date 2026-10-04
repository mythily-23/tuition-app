# Deploy to Railway.app (Easiest & Free)

Railway is the easiest way to deploy this app. It's completely free, takes 5 minutes, and your mom can access it from anywhere.

## Step 1: Push Code to GitHub

1. Create a GitHub account if you don't have one: https://github.com/signup
2. Create a new repository (keep it private if you want)
3. Push your code:
```bash
cd tuition-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tuition-app.git
git branch -M main
git push -u origin main
```

## Step 2: Sign Up on Railway

1. Go to https://railway.app
2. Click "Start for free"
3. Sign up with GitHub (easiest)
4. Authorize Railway to access your GitHub

## Step 3: Create New Project

1. Click "Create New Project" in your Railway dashboard
2. Select "Deploy from GitHub repo"
3. Find and select your `tuition-app` repository
4. Click "Deploy Now"
5. **Wait** - Railway will automatically detect Node.js and build your app

## Step 4: Add PostgreSQL Database

1. In your project, click the "+ Create" button
2. Select "Database"
3. Choose "PostgreSQL"
4. Click "Create"
5. **Wait** while it provisions (usually 1-2 minutes)

## Step 5: Configure Environment Variables

1. In your Railway project dashboard
2. Click on your app service
3. Go to the "Variables" tab
4. Railway should have auto-added `DATABASE_URL` from PostgreSQL
5. Add these variables:

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | `your-secret-key-2024` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**Note**: The `DATABASE_URL` is automatically set by PostgreSQL plugin

## Step 6: Deploy Your App

1. Make sure "Auto-deploy" is enabled
2. Railway will automatically deploy to production
3. Check the "Deployments" tab to watch it build

## Step 7: Access Your App

1. Go to "Settings" tab
2. Under "Public Networking", click "Generate Domain"
3. Copy the URL (it'll look like `https://tuition-app-prod.up.railway.app`)
4. Open in browser
5. Sign up / Login and start using!

---

## That's It! 🎉

Your app is now live and accessible 24/7. Share the URL with your mom.

---

## Troubleshooting

### App shows "502 Bad Gateway"

**Likely cause**: App crashed during startup

**Fix**:
1. Go to "Deployments" tab
2. Click on latest deployment
3. Check "Logs" for errors
4. Common issues:
   - Database URL not set → Add it in Variables
   - Port wrong → Make sure PORT=5000

### Database not initializing

**Fix**:
1. Railway auto-runs scripts sometimes, but if it doesn't:
2. Go to your app → Logs
3. You should see "✅ Database tables created successfully"
4. If not, you may need to run init manually (contact Railway support)

### Database connection refused

**Fix**:
1. Make sure PostgreSQL database is created
2. Check `DATABASE_URL` is in Variables
3. Format should be: `postgresql://user:pass@host:port/dbname`

### Custom Domain (Optional)

To use your own domain:
1. Go to Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `tuition.yourdomain.com`)
4. Follow DNS instructions
5. Wait for SSL certificate (auto)

---

## Updating Your App

When you make changes:

```bash
# Make changes to code
# Commit and push to GitHub
git add .
git commit -m "Your message"
git push origin main
```

**Railway will automatically redeploy within 1-2 minutes!**

---

## Monitoring & Maintenance

- **Check Logs**: Go to Deployments → Latest → Logs to see errors
- **View Database**: Use any PostgreSQL client with the `DATABASE_URL`
- **Scale Resources**: Go to Settings to upgrade (but free tier is fine for 50 students)
- **Backup Database**: Railway handles automatic backups

---

## Cost (It's Free!)

- **Free tier includes**:
  - 5GB Postgres database
  - 100GB outbound bandwidth
  - Unlimited deployments
  - Automatic SSL

This is plenty for your tuition center.

---

## Need Help?

Railway has great docs: https://docs.railway.app

Common issues? Email Railway support - they're responsive!

---

## Alternative: Render.com

If Railway doesn't work for you, Render.com is also free and similar:
1. Go to https://render.com
2. Connect GitHub
3. Deploy Web Service (select your repo)
4. Add PostgreSQL database
5. Set environment variables
6. Done!

Both are equally good - pick whichever you prefer.

---

**Your app is now on the internet! 🌐**
