const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname);
const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filename, defaultValue) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const text = fs.readFileSync(filePath, 'utf-8');
    return text.trim().length ? JSON.parse(text) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ensureDataDirectory();

function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId,
    redirectUri,
    scope: 'profile email',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  };
}

const usersFile = 'users.json';
const listingsFile = 'listings.json';
const rentalsFile = 'rentals.json';

const defaultListings = [
  {
    "id": "rent-001",
    "name": "Portable Projector",
    "price": 850,
    "image": "https://i.imgur.com/4Yp2ySm.jpg",
    "type": "rent",
    "category": "Electronics",
    "description": "A compact projector for home cinema and business presentations."
  },
  {
    "id": "rent-002",
    "name": "Camping Tent",
    "price": 450,
    "image": "https://i.imgur.com/lS7iHuk.jpg",
    "type": "rent",
    "category": "Outdoor",
    "description": "Lightweight 2-person tent for weekend trips."
  },
  {
    "id": "rent-003",
    "name": "Mountain Bike",
    "price": 1200,
    "image": "https://i.imgur.com/2xU3nI8.jpg",
    "type": "rent",
    "category": "Sports",
    "description": "A durable mountain bike for trails and city rides."
  },
  {
    "id": "sell-001",
    "name": "Office Chair",
    "price": 2800,
    "image": "https://i.imgur.com/vpHz4xp.jpg",
    "type": "buy",
    "category": "Furniture",
    "description": "Ergonomic office chair in great condition."
  },
  {
    "id": "sell-002",
    "name": "Bluetooth Speaker",
    "price": 1400,
    "image": "https://i.imgur.com/z5gQ1FQ.jpg",
    "type": "buy",
    "category": "Electronics",
    "description": "Portable speaker with crisp sound and long battery life."
  }
];

let users = readJson(usersFile, []);
let listings = readJson(listingsFile, defaultListings);
let rentals = readJson(rentalsFile, []);

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT_DIR));

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong' });
});

app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
  }

  const duplicate = users.find(u => u.username === username || u.email === email);
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'Username or email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    password
  };

  users.push(newUser);
  writeJson(usersFile, users);

  res.json({ success: true, message: 'Account created successfully.' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  res.json({ success: true, message: 'Login successful.', email: user.email, username: user.username });
});

app.post('/api/reset-password', (req, res) => {
  const { identifier, newPassword } = req.body || {};
  if (!identifier || !newPassword) {
    return res.status(400).json({ success: false, message: 'Username/email and new password are required.' });
  }

  const user = users.find(u => u.username === identifier || u.email === identifier);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with that username or email.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 5) {
    return res.status(400).json({ success: false, message: 'Password must be at least 5 characters long.' });
  }

  user.password = newPassword;
  writeJson(usersFile, users);

  res.json({ success: true, message: 'Password reset successfully.' });
});

app.get('/api/listings', (req, res) => {
  const type = (req.query.type || '').toLowerCase();
  const filtered = type ? listings.filter(item => item.type?.toLowerCase() === type) : listings;
  res.json({ success: true, items: filtered });
});

app.get('/api/rentals', (req, res) => {
  res.json({ success: true, rentals });
});

app.post('/api/rentals', (req, res) => {
  const rental = req.body;
  if (!rental || !rental.name) {
    return res.status(400).json({ success: false, message: 'Invalid rental payload.' });
  }

  rentals.push(rental);
  writeJson(rentalsFile, rentals);
  res.json({ success: true, message: 'Rental record saved.' });
});

app.get('/api/oauth-config', (req, res) => {
  const googleConfig = getGoogleOAuthConfig();
  res.json({
    success: true,
    google: googleConfig ? {
      authUrl: googleConfig.authUrl,
      clientId: googleConfig.clientId,
      redirectUri: googleConfig.redirectUri,
      scope: googleConfig.scope
    } : null,
    facebook: null
  });
});

app.get('/auth/google', (req, res) => {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return res.status(500).send('Google OAuth is not configured on the server.');
  }

  const state = Math.random().toString(36).substring(2);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    access_type: 'offline',
    prompt: 'select_account',
    state
  });

  res.redirect(`${config.authUrl}?${params.toString()}`);
});

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  const config = getGoogleOAuthConfig();
  if (!config) {
    return res.status(500).send('Google OAuth is not configured.');
  }

  try {
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).send('Failed to retrieve access token.');
    }

    const userResponse = await fetch(`${config.userInfoUrl}?access_token=${encodeURIComponent(tokenData.access_token)}`);
    const userData = await userResponse.json();
    const username = userData.name || userData.email?.split('@')[0] || 'google-user';
    const email = userData.email || '';

    res.redirect(`/login.html?socialLogin=true&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).send('Google OAuth callback failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
