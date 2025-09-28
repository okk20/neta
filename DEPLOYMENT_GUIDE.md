# Deployment Guide for School Examination Management System

This guide provides instructions for deploying your full-stack Vite/React application with backend API to various platforms.

## Frontend Build Command
To build your frontend application:
```bash
npm run build
```
This creates a `dist` folder containing your production-ready static files.

## Backend Deployment

The application includes a backend API that can be deployed separately. A Node.js/Express server is provided in `server.js`.

### Backend Build and Run
1. Install dependencies: `npm install express cors`
2. To run the backend server: `npm run backend`

## Deployment Options

### 1. Netlify (Frontend + Functions)
1. Create an account at [Netlify](https://netlify.com)
2. Frontend:
   - Connect your Git repository
   - Set build command to: `npm run build`
   - Set publish directory to: `dist`
3. For backend functionality, deploy the API separately or use Netlify Functions

### 2. Vercel (Frontend Only - Currently Deployed)
1. Frontend deployment: https://netd-r956jr57j-takyiamy2019-6595s-projects.vercel.app
2. For backend functionality, deploy the API separately
3. Install Vercel CLI: `npm i -g vercel`
4. Run: `vercel` and follow the prompts

### 3. Render (Recommended for Full-Stack)
1. Create an account at [Render](https://render.com)
2. Frontend (Static Site):
   - Create a new "Static Site" instance
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
3. Backend (Web Service):
   - Create a new "Web Service"
   - Connect your Git repository
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm run backend`
   - Add environment variable for MongoDB connection:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://takyiamy2019_db:sjtaoOULf3Nyr9sb@sems-cluster.atwkdw2.mongodb.net/?retryWrites=true&w=majority&appName=Sems-Cluster`

### 4. Railway (Full-Stack)
1. Create an account at [Railway](https://railway.app)
2. Connect your Git repository
3. For the frontend, use static deployment
4. For the backend, set up a service with:
   - Build command: `npm install`
   - Start command: `npm run backend`
   - Environment variables for MongoDB connection

### 5. Heroku (Backend)
1. Create an account at [Heroku](https://heroku.com)
2. Install Heroku CLI: `heroku create`
3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://takyiamy2019_db:sjtaoOULf3Nyr9sb@sems-cluster.atwkdw2.mongodb.net/?retryWrites=true&w=majority&appName=Sems-Cluster
   ```
4. Deploy: `git push heroku main`

### 6. GitHub Pages (Frontend Only)
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

### 7. Firebase Hosting (Frontend) + Functions (Backend)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting functions`
4. For hosting:
   - Public directory: `dist`
   - Configure as single-page app: Yes
5. For functions, set up your backend API in the functions directory

## Database Configuration

Your MongoDB connection string is:
```
mongodb+srv://takyiamy2019_db:sjtaoOULf3Nyr9sb@sems-cluster.atwkdw2.mongodb.net/?retryWrites=true&w=majority&appName=Sems-Cluster
```

When deploying the backend, make sure you set this as an environment variable (e.g., `MONGODB_URI`) in your hosting platform.

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create a new student
- `GET /api/students/:id` - Get a specific student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create a new teacher

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a new subject

### Scores
- `GET /api/scores` - Get all scores
- `POST /api/scores` - Create a new score

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting

## Environment Variables

Most platforms support environment variables:
- Render: Environment variables section in dashboard
- Railway: Variables tab in dashboard
- Heroku: Settings → Config Vars
- Vercel: Project settings → Environment variables
- Netlify: Site settings → Build & deploy → Environment

## Troubleshooting

If you encounter issues:
1. Verify your build works locally: `npm run build && npm run preview`
2. Check that your app handles client-side routing properly (React Router setup)
3. Ensure environment variables are properly configured in the deployment platform
4. Check browser console for client-side errors after deployment
5. For backend issues, check server logs on your hosting platform

## Recommended Option

For a complete full-stack deployment, **Render** is recommended as it easily supports both static frontend hosting and backend web services with environment variable management. You can deploy the frontend to Vercel (already done) and the backend to Render/Heroku/Railway connected to your MongoDB database.