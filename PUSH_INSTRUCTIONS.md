# How to Push Reporting Service to GitHub

## Current Status
✅ Files are committed locally (commit: 4c98c38)
⚠️ Need to authenticate to push to GitHub

## Method 1: Using Personal Access Token (Recommended)

### Step 1: Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "ERP-Reporting-Service"
4. Select scope: **repo** (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push to GitHub
```bash
cd /Users/s/Desktop/Konecta-ERP-System-develop
git push -u origin develop
```

When prompted:
- **Username**: Enter your GitHub username (Abdu-khaled)
- **Password**: Paste the Personal Access Token (NOT your GitHub password)

---

## Method 2: Using SSH (If you have SSH keys set up)

### Step 1: Switch to SSH URL
```bash
cd /Users/s/Desktop/Konecta-ERP-System-develop
git remote set-url origin git@github.com:Abdu-khaled/Konecta-ERP-System.git
```

### Step 2: Push
```bash
git push -u origin develop
```

---

## Method 3: Using GitHub CLI (If installed)

```bash
gh auth login
git push -u origin develop
```

---

## Verify After Push

Check if your files are on GitHub:
- Visit: https://github.com/Abdu-khaled/Konecta-ERP-System/tree/develop/backend/reporting-service

---

## Troubleshooting

**If you get "Authentication failed":**
- Make sure you're using a Personal Access Token, not your password
- Check that the token has "repo" scope
- Token might have expired (create a new one)

**If you get "Permission denied":**
- Verify you have push access to the repository
- Check if the repository is under your account

