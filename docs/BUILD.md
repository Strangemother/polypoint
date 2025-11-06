# Build & Distribution

This document explains how to build minified and bundled versions of the Polypoint library.

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Build all minified files and bundles
npm run build
```

The build process creates:
- **Individual minified files**: Each `.js` file → `.min.js` (e.g., `point.min.js`)
- **Bundle files**: Groups of related modules → `.bundle.min.js` (e.g., `point.bundle.min.js`)
- **Compressed files**: Gzipped versions → `.js.gz` for both individual and bundle files

All output goes to the `dist/` directory.

## What Gets Built

### Individual Files
Every JavaScript file in `point_src/` is minified while preserving:
- Directory structure
- Class and function names
- Comments marked with `/*!` (license info, etc.)

### Bundle Files
Based on `point_src/files.json`, related modules are combined into bundles:

```javascript
// files.json defines bundles like:
{
  "point": ["pointpen.js", "point-content.js", "pointdraw.js", "point.js"],
  "stage": ["stage-hooks.js", "stage-resize.js", "stage.js"],
  // ... etc
}
```

Each bundle entry becomes a `[name].bundle.min.js` file in `dist/`.

### Nested Bundles
Bundles can reference other bundles:

```javascript
{
  "everything": ["head", "point", "other"]  // References other bundle names
}
```

The build script automatically resolves these references recursively.

## Using Minified Files

### Option 1: Individual Files
```html
<script src="dist/core/head.min.js"></script>
<script src="dist/point.min.js"></script>
<script src="dist/stage.min.js"></script>
```

### Option 2: Bundle Files
```html
<!-- Get Point + dependencies in one file -->
<script src="dist/point.bundle.min.js"></script>
<script src="dist/stage.bundle.min.js"></script>
```

### Option 3: Everything
```html
<!-- The whole library -->
<script src="dist/everything.bundle.min.js"></script>
```

## Build Configuration

The build script (`build-minify.js`) uses **esbuild** with these settings:

```javascript
{
  minify: true,           // Remove whitespace, shorten names where safe
  target: 'es2020',       // Modern JS features
  format: 'esm',          // ES modules
  keepNames: true,        // Preserve class/function names for debugging
}
```

### Why These Settings?
- **No transpilation**: Your source uses modern JS features; they stay modern
- **Keep names**: Makes debugging easier, negligible size impact
- **ESM format**: Matches your source code module format

## File Sizes

Typical compression ratios:
- **Minification**: 60-70% size reduction
- **Gzip compression**: 80-90% size reduction from original

Example (`point.js`):
```
21.9KB (source) → 5.4KB (minified, 75% reduction) → 2.2KB (gzipped, 90% reduction)
```

## Advanced Usage

### Serving Gzipped Files
If your web server supports pre-compressed files, use the `.gz` versions:

**Nginx example:**
```nginx
location /dist/ {
    gzip_static on;
}
```

**Express.js example:**
```javascript
app.use(express.static('dist', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js') && fs.existsSync(path + '.gz')) {
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'application/javascript');
        }
    }
}));
```

### Custom Bundles
To create new bundles, edit `point_src/files.json`:

```javascript
{
  "myBundle": [
    "point.js",
    "stage.js",
    "dragging.js"
  ]
}
```

Then run `npm run build` to generate `dist/myBundle.bundle.min.js`.

## Build Script Details

The `build-minify.js` script:

1. **Cleans** the `dist/` directory
2. **Discovers** all `.js` files in `point_src/` (recursively)
3. **Minifies** each file to `dist/[path].min.js`
4. **Compresses** each minified file with gzip
5. **Resolves** bundle definitions from `files.json`
6. **Concatenates** files for each bundle
7. **Minifies** the concatenated bundle
8. **Compresses** each bundle with gzip

### Error Handling
- Files with syntax errors are skipped with a warning
- Circular bundle references are detected and broken
- Missing bundle references show warnings

## Troubleshooting

### Build fails with syntax error
Some files may have intentional syntax experiments. These are safely skipped during the build.

### Bundle doesn't contain expected files
Check `point_src/files.json` for the bundle definition and ensure all referenced files exist.

### File sizes seem large
Remember to check the `.gz` sizes - that's what users will download. The minified sizes are for uncompressed serving only.

## See Also

- `dist/README.md` - Detailed information about distribution files
- `point_src/files.json` - Bundle definitions
- `build-minify.js` - Build script source code
