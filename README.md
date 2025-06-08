# 📘 Development Log

This document contains a chronological, commit-by-commit breakdown of the development process.

---

### 🔖 Commit: `b71e53f`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-14  
**Message**: Added GitHub OAuth

### 🔍 Changed Functions:

```js
const GithubRedirectHandler = (req, res) => {
    const url = `https://github.com/login/oauth/authorize?...`;
    return res.redirect(url);
};
```

🔁 **Summary**: Initiates GitHub OAuth by redirecting to GitHub’s authorization endpoint.

```js
const GithubCallbackHandler = async (req, res) => {
    const { code } = req.query;
    // Exchanges code for access_token
    // Fetches GitHub user info & email
    // Finds or creates user in DB
    // Signs and sets access & refresh tokens in cookies
    // Returns login success response
};
```

🔁 **Summary**: Handles GitHub’s OAuth callback, creates or updates user, sets tokens, and returns login response.

```js
const HashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
```

🔁 **Summary**: Generates a SHA-256 hash of a token for secure storage.

---

### 🔖 Commit: `4af244a`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-12  
**Message**: Added Google OAuth

### 🔍 Changed Functions:

```js
const GoogleRedirectHandler = (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?...`;
    return res.redirect(url);
};
```

🔁 **Summary**: Initiates Google OAuth by redirecting to Google’s authorization screen.

```js
const GoogleCallbackHandler = async (req, res) => {
    // Exchanges code for access_token
    // Fetches Google user info
    // Finds or creates user in DB
    // Signs and sets access & refresh tokens in cookies
    // Returns login success response
};
```

🔁 **Summary**: Handles Google OAuth callback, creates or updates user, and sets tokens.

---

### 🔖 Commit: `906de26`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-08  
**Message**: Hashed the Refresh Token

### 🔍 Changed Functions:

```js
user.refreshToken = HashToken(refreshToken);
```

🔁 **Summary**: Stores hashed refresh token in database instead of plain text for enhanced security.

---

### 🔖 Commit: `3a29038`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-06  
**Message**: Added cookie-parser to enable use of cookies in express

---

### 🔖 Commit: `e9aa95f`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-05  
**Message**: Added /profile, /logout and /refresh-token

### 🔍 Changed Functions:

```js
const ProfileHandler = async (req, res) => {
    const user = await User.findById(req.user.userId, { ... });
    return res.json({ user });
};
```

🔁 **Summary**: Retrieves authenticated user's profile details including username, email, and stats.

```js
const RefreshHandler = async (req, res) => {
    const token = req.cookies.refreshToken;
    // Verifies token, issues a new access token
};
```

🔁 **Summary**: Validates refresh token and issues a new access token.

```js
const LogoutHandler = async (req, res) => {
    // Deletes refresh token from DB
    // Clears cookies
};
```

🔁 **Summary**: Logs out user by invalidating tokens and clearing cookies.

```js
const AuthMiddleware = async (req, res, next) => {
    // Verifies access token and appends user to request
};
```

🔁 **Summary**: Middleware to protect routes by checking access token.

---

### 🔖 Commit: `5c4e5ee`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-03  
**Message**: Added /login

### 🔍 Changed Functions:

```js
const LoginHandler = async (req, res) => {
    // Verifies email and password
    // Generates and sets access & refresh tokens
};
```

🔁 **Summary**: Authenticates user using email and password, and sets login tokens.

---

### 🔖 Commit: `fd27ea2`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-03  
**Message**: Added /verify-email

### 🔍 Changed Functions:

```js
const VerificationHandler = async (req, res) => {
    // Verifies email using token in query
};
```

🔁 **Summary**: Confirms user’s email using a verification token.

---

### 🔖 Commit: `2af4d55`

**Author**: Yash Kumar Gupta  
**Date**: 2025-03-02  
**Message**: Added /register

### 🔍 Changed Functions:

```js
const RegisterHandler = async (req, res) => {
    // Registers user or reuses existing
    // Generates verification token
    // Sends email with token link
};
```

🔁 **Summary**: Handles user registration, generates email verification token, and sends email.
