import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { clearInvalidRememberedLoginData } from './utils/rememberMe.js';
// Register the permission matrix with the module registry so
// getNavigationForRole() can filter the sidebar without modules.js
// itself depending on permissions.js (avoids a circular import).
import './config/navigation.js';
import './styles/theme.css';
import './index.css';

// One-time boot cleanup: wipe any legacy / unsafe login keys that earlier
// builds may have written (rememberMe, rememberedEmailId, rememberedPassword,
// email, password, demoEmail, demoPassword, currentDemoUser, …). This
// guarantees the Log In form starts empty unless a valid Remember Me entry
// (Email ID only) is on disk.
clearInvalidRememberedLoginData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
