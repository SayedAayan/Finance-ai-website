import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './app-styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
