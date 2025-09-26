// Check if we're running in a mobile environment (Capacitor)
const isBrowser = typeof window !== 'undefined';
const isMobile = isBrowser && (window as any).Capacitor !== undefined;
const isElectron = isBrowser && (window as any).electronAPI !== undefined;
const isVercel = import.meta.env.VITE_VERCEL === '1' || import.meta.env.VITE_NOW_REGION !== undefined;

// Get API endpoint for Electron apps
const getElectronApiEndpoint = () => {
  if (isElectron && (window as any).electronAPI.getApiEndpoint) {
    return (window as any).electronAPI.getApiEndpoint();
  }
  return 'http://localhost:5000/api'; // Default for Electron
};

// API Configuration
// Prefer VITE_API_URL in any mode to allow connecting to a real backend when mocks are disabled.
// Fallbacks remain for electron/mobile/vercel or plain relative /api.
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? (isElectron ? getElectronApiEndpoint() :
      (isMobile ? 'https://your-backend-app.onrender.com/api' :
      (isVercel ? '/api' : '/api')))
    : '/api');

export default API_BASE_URL;