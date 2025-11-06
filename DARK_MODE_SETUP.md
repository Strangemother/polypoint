# GitHub Pages Dark Mode Setup

## What Was Changed

I've added dark mode to your GitHub Pages site by creating three files:

### 1. `_config.yml` (Jekyll Configuration)
- Sets the site title and description
- Specifies the Jekyll theme (minimal)
- Enables custom head includes

### 2. `_includes/head-custom.html` (Custom Dark Mode Styles)
- Contains CSS that overrides the default light theme
- Uses CSS custom properties (variables) for easy customization
- Includes styles for:
  - Dark backgrounds (#0d1117)
  - Light text (#c9d1d9)
  - Blue accent links (#58a6ff)
  - Dark code blocks (#161b22)
  - Proper contrast for all elements

### 3. `assets/css/style.scss` (Alternative Method)
- An SCSS file that can also override theme styles
- Currently set up but the `head-custom.html` approach is more direct

## Color Scheme

The dark mode uses GitHub's own dark theme colors:
- **Background**: #0d1117 (very dark blue-black)
- **Secondary Background**: #161b22 (slightly lighter)
- **Text**: #c9d1d9 (light gray)
- **Links**: #58a6ff (bright blue)
- **Code**: #ff7b72 (coral red on dark background)
- **Borders**: #30363d (dark gray)

## How to Deploy

1. **Commit the changes:**
   ```bash
   git add _config.yml _includes/head-custom.html assets/css/style.scss
   git commit -m "Add dark mode to GitHub Pages"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Wait for deployment:**
   - GitHub Pages will automatically rebuild (takes 1-5 minutes)
   - Check your site at: https://strangemother.github.io/polypoint/

4. **Verify the changes:**
   - Open your GitHub Pages URL in a browser
   - The site should now have a dark background with light text

## Customizing Colors

To change the color scheme, edit `/workspaces/polypoint/_includes/head-custom.html` and modify the CSS variables at the top:

```css
:root {
  --bg-primary: #0d1117;      /* Main background */
  --bg-secondary: #161b22;     /* Code blocks, alternating rows */
  --text-primary: #c9d1d9;     /* Main text */
  --link-color: #58a6ff;       /* Links */
  /* ... etc */
}
```

## Alternative: Light/Dark Mode Toggle

If you want users to be able to switch between light and dark modes, you would need to:
1. Add JavaScript to detect system preferences or add a toggle button
2. Use `prefers-color-scheme` media queries
3. Store user preference in localStorage

Let me know if you'd like me to implement that!

## Testing Locally

To test the dark mode locally before pushing:

```bash
# Install Jekyll (if not already installed)
gem install bundler jekyll

# Create a Gemfile if needed
echo 'gem "github-pages", group: :jekyll_plugins' > Gemfile

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open http://localhost:4000 in your browser
```

## Troubleshooting

**If dark mode doesn't apply:**
1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check that the files are committed and pushed
3. Wait a few minutes for GitHub Pages to rebuild
4. Check the GitHub Actions tab for any build errors

**If some elements are still light:**
- The `!important` flags ensure the dark styles override the theme
- You may need to add additional selectors for specific elements
