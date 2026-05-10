# Social Login (OAuth) Setup Guide

This guide will help you configure social login for ReuseMart using Google, GitHub, Facebook, and LinkedIn OAuth.

## Quick Start (Demo Mode)

Social buttons are currently working in **demo mode**. They show placeholder errors because OAuth credentials are not configured. To test the UI:

1. Click any social button (G, f, gh, in)
2. You'll see a message: "Platform login not configured yet"
3. Follow the instructions below to set up real OAuth

---

## 🔵 Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
7. Copy your **Client ID**

### 2. Update login.html

Find this line in `login.html`:
```javascript
google: {
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
```

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID from step 7.

### 3. Update server.js (Optional - for production)

In `/auth/google/callback` route, you should exchange the code for tokens using the Google API:

```javascript
// Exchange authorization code for access token
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: JSON.stringify({
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: 'http://localhost:3000/auth/google/callback',
    grant_type: 'authorization_code'
  })
});
```

---

## 🐙 GitHub OAuth Setup

### 1. Register GitHub OAuth App

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: ReuseMart
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: 
     ```
     http://localhost:3000/auth/github/callback
     ```
4. Copy your **Client ID**

### 2. Update login.html

Find this line:
```javascript
github: {
  clientId: 'YOUR_GITHUB_CLIENT_ID',
```

Replace `YOUR_GITHUB_CLIENT_ID` with your actual Client ID.

### 3. For Production

Store your Client Secret securely and update server.js:

```javascript
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
// Exchange code for access token
const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: JSON.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: clientSecret,
    code: code
  })
});
```

---

## 👨‍💼 LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create App**
3. Fill in required details
4. Authorized redirect URLs:
   ```
   http://localhost:3000/auth/linkedin/callback
   https://yourdomain.com/auth/linkedin/callback
   ```
5. Copy your **Client ID** from the Auth section

### 2. Update login.html

Find this line:
```javascript
linkedin: {
  clientId: 'YOUR_LINKEDIN_CLIENT_ID',
```

Replace with your actual Client ID.

### 3. For Production

Update server.js to exchange code for tokens:

```javascript
const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: 'http://localhost:3000/auth/linkedin/callback'
  })
});
```

---

## 📘 Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Choose **Consumer** app type
4. Fill in app details
5. Add **Facebook Login** product
6. Go to **Settings → Basic** and copy **App ID**
7. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/auth/facebook/callback
   https://yourdomain.com/auth/facebook/callback
   ```

### 2. Update login.html

Find this line:
```javascript
facebook: {
  appId: 'YOUR_FACEBOOK_APP_ID',
```

Replace with your actual App ID.

### 3. For Production

Update server.js:

```javascript
const appSecret = process.env.FACEBOOK_APP_SECRET;
const tokenResponse = await fetch(
  `https://graph.facebook.com/v12.0/oauth/access_token?` +
  `client_id=${process.env.FACEBOOK_APP_ID}&` +
  `client_secret=${appSecret}&` +
  `redirect_uri=http://localhost:3000/auth/facebook/callback&` +
  `code=${code}`
);
```

---

## 🔒 Security Best Practices

### For Development:
- Store credentials in `.env` file (NOT in code)
- Use `http://localhost:3000` as redirect URI

### For Production:
1. **Use environment variables**:
   ```bash
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   GITHUB_CLIENT_ID=xxx
   # etc.
   ```

2. **Install dotenv**:
   ```bash
   npm install dotenv
   ```

3. **Load in server.js**:
   ```javascript
   require('dotenv').config();
   const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
   ```

4. **Never commit `.env` file** - add to `.gitignore`

5. **Exchange codes server-side**:
   - Never expose Client Secret in frontend code
   - Always exchange authorization codes on backend
   - Store tokens securely

6. **Validate state parameter**:
   - Prevents CSRF attacks
   - Already implemented in login.html

---

## 🧪 Testing OAuth Flow

### Without Full OAuth Setup:
1. Click any social button
2. Currently shows "not configured yet" message
3. This is expected - it's waiting for credentials

### With OAuth Setup:
1. Click social button
2. Redirected to provider's login page
3. User authorizes your app
4. Redirected back to `http://localhost:3000/auth/[provider]/callback`
5. User is logged in to ReuseMart

---

## 🐛 Troubleshooting

### "Invalid Redirect URI"
- Check that redirect URI in your OAuth app matches exactly
- Include `/auth/[provider]/callback` path
- For local development, use `http://localhost:3000` (not `https`)

### "Client ID not recognized"
- Verify you copied the correct credentials
- Make sure you're using Client ID, not Client Secret
- Check for extra spaces or typos

### CORS Errors
- CORS is already enabled in server.js
- Ensure `app.use(cors())` is before routes

### User Data Not Saving
- Check that `/api/signup` is working with traditional login first
- Make sure `data/users.json` file exists and is writable

---

## 📦 What Happens After OAuth Login?

1. User clicks social button
2. Redirected to provider (Google, GitHub, etc.)
3. User authorizes ReuseMart
4. Redirected back with authorization code
5. Server creates/finds user in database
6. User logged in with:
   - Username: `provider_timestamp` (e.g., `google_1234567890`)
   - Email: `provider_timestamp@provider.local`
7. Redirected to `home.html`

---

## 📝 Next Steps

1. Choose which providers you want to support
2. Create OAuth apps (see steps above)
3. Update `login.html` with Client IDs
4. Test by clicking social buttons
5. For production, implement full token exchange on backend

---

## ✅ Checklist

- [ ] Google OAuth configured
- [ ] GitHub OAuth configured
- [ ] LinkedIn OAuth configured
- [ ] Facebook OAuth configured
- [ ] Credentials updated in login.html
- [ ] Tested social login flow
- [ ] Credentials secured (using .env for production)
- [ ] Redirect URIs match in all OAuth apps
