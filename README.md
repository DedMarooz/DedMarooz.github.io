# Alex Zaretski — Portfolio Site

Source for dedmarooz.github.io

## Before pushing

1. Open `index.html` and replace:
   - `YOUR_EMAIL_HERE` → your real email
   - `YOUR_LINKEDIN_URL` → your LinkedIn profile URL
   - `linkedin.com/in/yourprofile` → your actual LinkedIn handle

## How to push to GitHub Pages

Run these commands one time:

```bash
cd /Users/alexanderzaretski/Documents/AI/portfolio-site

git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/DedMarooz/DedMarooz.github.io.git
git push -u origin main
```

The site will be live at: https://DedMarooz.github.io
(GitHub takes 1–3 minutes to build after first push)

## Custom domain (optional, ~$10/yr)

1. Buy domain on Namecheap (e.g. alexzaretski.com)
2. Create a file named `CNAME` in this folder with your domain:
   ```
   alexzaretski.com
   ```
3. In Namecheap DNS settings, add these A records pointing to GitHub:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
4. In GitHub repo Settings → Pages → Custom domain → enter your domain

## To update the site later

```bash
git add .
git commit -m "update projects"
git push
```
