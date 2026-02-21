// Automatically detect protocol (http or https)
const protocol = window.location.protocol;

// If backend is on same server (recommended)
const host = '13.51.242.38';

// Change port if needed
const port = '4000';

// Build base URL
export const API_BASE_URL = `${protocol}//${host}:${port}`;