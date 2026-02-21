// Automatically detect protocol (http or https)
const protocol = 'https:' === window.location.protocol ? 'https:' : 'http:';

// If backend is on same server (recommended)
const host = 'www.crypticsapi.live';

// Change port if needed
const port = '4000';

// Build base URL
export const API_BASE_URL = `${protocol}//${host}`;