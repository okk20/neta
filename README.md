# School Examination Management System (SEMS)

A comprehensive web application for managing school examinations, student records, teacher information, subjects, scores, and reports.

## Features

- Student Management
- Teacher Management 
- Subject Management
- Score Management
- Reports Generation
- Promotion Management
- WhatsApp Messaging Integration
- User Authentication & Authorization
- Responsive Design

## Technologies Used

- React with TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- MSW (Mock Service Worker for API mocking)
- Radix UI Components
- Lucide React Icons

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The app will be available at `http://localhost:5173`

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Project Structure

- `src/` - Main source code
- `src/components/` - React components
- `src/utils/` - Utility functions
- `src/mocks/` - Mock service worker setup
- `src/constants/` - Constant values

## API Mocking

This project uses MSW (Mock Service Worker) to simulate API calls. All API endpoints are mocked and no backend server is required for frontend development.

## Database Configuration

The application can be connected to a MongoDB database using the following connection string:
`mongodb+srv://takyiamy2019_db:sjtaoOULf3Nyr9sb@sems-cluster.atwkdw2.mongodb.net/?retryWrites=true&w=majority&appName=Sems-Cluster`

## Deployment Options

### Frontend Only (Current Vercel Deployment)
The frontend has been deployed to Vercel at: https://netd-r956jr57j-takyiamy2019-6595s-projects.vercel.app

Note: For full functionality, you'll need to host the API routes separately.

### Full Stack Deployment Options

If you need both frontend and backend functionality, consider these alternatives:

1. **Render**: 
   - Deploy frontend as static site
   - Deploy backend API as web service connected to MongoDB
   - Use the server.js file provided for the backend

2. **Railway**: 
   - For deploying the full-stack application with MongoDB integration
   - Deploy both frontend and backend with environment variables

3. **Heroku**: 
   - Deploy the backend server connected to MongoDB
   - The server.js file is ready for Heroku deployment

4. **Netlify**: 
   - Frontend hosting with serverless functions
   - Backend API can be deployed separately with MongoDB

5. **AWS/GCP/DO**: 
   - Self-hosted deployment with full control
   - Deploy the Express server with MongoDB connection

## Backend API Server

A Node.js/Express server is provided in `server.js` that includes:
- All API endpoints for student, teacher, subject, score management
- Authentication endpoints
- Settings management
- Connection to MongoDB database

To run the backend server locally:
1. Update the database connection in server.js to use your MongoDB connection string
2. Run: `npm run backend`

## Development API Routes

The development API routes are located in the `api/` directory and use Vercel's API route format. These routes work during development with MSW and will need to be deployed separately for production use.

## License

This project is open source and available under the MIT License.