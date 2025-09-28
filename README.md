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

## Deployment Options

### Frontend Only (Current Vercel Deployment)
The frontend has been deployed to Vercel at: https://netd-r956jr57j-takyiamy2019-6595s-projects.vercel.app

Note: For full functionality, you'll need to host the API routes separately.

### Alternative Deployment Options

If you need both frontend and backend functionality, consider these alternatives:

1. **Netlify**: Supports both static hosting and serverless functions
   - Frontend will be served from the `dist` directory
   - API routes can be deployed as Netlify functions

2. **Railway**: For deploying the full-stack application with a proper backend
   - Move the API routes to a proper Node.js/Express backend
   - Deploy both frontend and backend separately

3. **Render**: Supports static sites and web services
   - Deploy frontend as static site
   - Deploy backend API as web service

4. **Firebase Hosting + Functions**: 
   - Host the frontend on Firebase Hosting
   - Deploy API routes as Firebase Functions

## Development API Routes

The development API routes are located in the `api/` directory and use Vercel's API route format. These routes work during development with MSW and will need to be deployed separately for production use.

## License

This project is open source and available under the MIT License.