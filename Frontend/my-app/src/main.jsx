import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import { API_URL } from './constants.JS'

// Configure axios base URL and credentials globally
axios.defaults.withCredentials = true;
if (API_URL) {
  // If API_URL ends with /api or with a trailing slash, normalize
  const base = API_URL.replace(/\/$/, '');
  axios.defaults.baseURL = base;
} else {
  axios.defaults.baseURL = '/api';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
