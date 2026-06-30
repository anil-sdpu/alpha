// Central frontend configuration
// Change `UPLOADS_BASE_URL` to point to your backend uploads path when needed.
// Base URL used when viewing practice uploads.
// Set to a file:// URL pointing to your local uploads folder so the browser can open files directly.
// Only the filename is substituted dynamically by the frontend.
// Use the backend-served uploads URL so the browser can fetch files over HTTP.
// Browsers block loading local `file:///` resources from pages served via HTTP.
export const UPLOADS_BASE_URL = 'http://localhost:4000/uploads/practice';

export default {
  UPLOADS_BASE_URL,
};
