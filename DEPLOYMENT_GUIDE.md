# Deployment Guide for School Examination Management System

This guide provides instructions for deploying your Vite/React application to various platforms.

## Build Command
Before deploying to any platform, you'll need to build your application:
```bash
npm run build
```
This creates a `dist` folder containing your production-ready static files.

## Deployment Options

### 1. Netlify
1. Create an account at [Netlify](https://netlify.com)
2. Option A - Drag and drop:
   - Build your app: `npm run build`
   - Drag the entire `dist` folder to the Netlify dashboard
3. Option B - Git integration:
   - Connect your Git repository
   - Set build command to: `npm run build`
   - Set publish directory to: `dist`
   - Add environment variables if needed

### 2. Vercel (Fixed Configuration)
1. Update your `vercel.json` to be simpler for a static app:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```
2. Install Vercel CLI: `npm i -g vercel`
3. Run: `vercel` and follow the prompts

### 3. GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to your `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
3. Run: `npm run deploy`
4. In your GitHub repository settings, go to Pages and select the branch where files were pushed

### 4. Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. When prompted:
   - Public directory: `dist`
   - Configure as single-page app: Yes
   - File to overwrite: Yes
5. Build: `npm run build`
6. Deploy: `firebase deploy`

### 5. Cloudflare Pages
1. Create an account at [Cloudflare](https://pages.cloudflare.com)
2. Connect your Git repository
3. Set build configuration:
   - Framework preset: None (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `.` (or your repo root)

### 6. Render
1. Create an account at [Render](https://render.com)
2. Create a new "Static Site" instance
3. Connect your Git repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables if needed

### 7. AWS Amplify
1. Create an account at [AWS Amplify](https://aws.amazon.com/amplify/)
2. Connect your Git repository
3. In the settings, set:
   - Build type: JavaScript
   - Framework: Vite
   - Build specification: 
     - Build command: `npm run build`
     - Artifacts: `dist` folder

## API Considerations

Since your project has an `/api` folder, you'll need to decide what to do with your backend:

1. **Serverless Functions**: Platforms like Vercel, Netlify, and Cloudflare Pages support serverless functions
2. **Separate Backend**: Host your API on platforms like Render, Railway, or Heroku
3. **Third-party API**: Use external services like Supabase, Firebase, or AWS AppSync

For serverless functions, the approach varies by platform:
- **Vercel**: Functions in `api` folder
- **Netlify**: Functions in `netlify/functions` folder
- **Cloudflare**: Use Workers or Pages Functions

## Environment Variables

Most platforms support environment variables:
- Netlify: Dashboard settings → Environment variables
- Vercel: Project settings → Environment variables  
- GitHub Pages: Not directly supported (need to build with variables at build time)
- Firebase: Use Firebase Extensions or Functions
- Cloudflare: Dashboard settings
- Render: Environment variables section

## Troubleshooting

If you encounter issues:
1. Verify your build works locally: `npm run build && npm run preview`
2. Check that your app handles client-side routing properly (React Router setup)
3. Ensure environment variables are properly configured in the deployment platform
4. Check browser console for client-side errors after deployment

## Recommended Option

For a quick and reliable deployment, **Netlify** is recommended due to its simplicity and excellent React/Vite support. If you prefer free options, **GitHub Pages** or **Firebase Hosting** are good choices.