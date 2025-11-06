#!/usr/bin/env node

/**
 * Polypoint Build & Minify Script
 * 
 * This script:
 * 1. Minifies all individual .js files from point_src/ to dist/
 * 2. Creates bundle files based on files.json entries
 * 3. Compresses all outputs with gzip
 * 
 * Usage: node build-minify.js
 */

import * as esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const SRC_DIR = 'point_src';
const DIST_DIR = 'dist';
const FILES_JSON = path.join(SRC_DIR, 'files.json');

// Color output helpers
const colors = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    blue: (s) => `\x1b[34m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

/**
 * Recursively get all .js files from a directory
 */
async function getAllJsFiles(dir, fileList = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await getAllJsFiles(fullPath, fileList);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            fileList.push(fullPath);
        }
    }
    
    return fileList;
}

/**
 * Minify a single file
 */
async function minifyFile(srcPath, distPath) {
    const distDir = path.dirname(distPath);
    await fs.mkdir(distDir, { recursive: true });
    
    try {
        const result = await esbuild.build({
            entryPoints: [srcPath],
            outfile: distPath,
            minify: true,
            target: 'es2020',
            format: 'esm',
            keepNames: true, // Keep class/function names for debugging
            logLevel: 'silent',
        });
        
        return true;
    } catch (error) {
        console.error(`Error minifying ${srcPath}:`, error.message);
        return false;
    }
}

/**
 * Compress a file with gzip
 */
async function gzipFile(filePath) {
    const gzPath = `${filePath}.gz`;
    const source = createReadStream(filePath);
    const destination = createWriteStream(gzPath);
    const gzip = createGzip({ level: 9 });
    
    await pipeline(source, gzip, destination);
    
    // Get sizes for reporting
    const [originalSize, gzSize] = await Promise.all([
        fs.stat(filePath).then(s => s.size),
        fs.stat(gzPath).then(s => s.size)
    ]);
    
    return { originalSize, gzSize };
}

/**
 * Load and parse files.json
 */
async function loadFilesJson() {
    const content = await fs.readFile(FILES_JSON, 'utf-8');
    return JSON.parse(content);
}

/**
 * Resolve bundle entries recursively
 * Handles references to other bundles (e.g., "head" -> ["core/head.js"])
 */
function resolveBundle(bundleName, filesConfig, visited = new Set()) {
    if (visited.has(bundleName)) {
        console.warn(colors.yellow(`⚠️  Circular reference detected: ${bundleName}`));
        return [];
    }
    
    visited.add(bundleName);
    const entries = filesConfig[bundleName];
    
    if (!entries) {
        console.warn(colors.yellow(`⚠️  Bundle "${bundleName}" not found in files.json`));
        return [];
    }
    
    const resolvedFiles = [];
    
    for (const entry of entries) {
        if (entry.endsWith('.js')) {
            // It's a file reference
            resolvedFiles.push(path.join(SRC_DIR, entry));
        } else {
            // It's a bundle reference - recurse
            const subFiles = resolveBundle(entry, filesConfig, visited);
            resolvedFiles.push(...subFiles);
        }
    }
    
    // Remove duplicates while preserving order
    return [...new Set(resolvedFiles)];
}

/**
 * Create a bundle file by concatenating sources
 */
async function createBundle(bundleName, files, filesConfig) {
    const bundlePath = path.join(DIST_DIR, `${bundleName}.bundle.min.js`);
    
    console.log(colors.blue(`\n📦 Creating bundle: ${bundleName}`));
    console.log(colors.dim(`   Files: ${files.length}`));
    
    // Resolve all files in the bundle
    const resolvedFiles = resolveBundle(bundleName, filesConfig);
    
    if (resolvedFiles.length === 0) {
        console.warn(colors.yellow(`⚠️  No files resolved for bundle: ${bundleName}`));
        return null;
    }
    
    // Read all source files
    const contents = await Promise.all(
        resolvedFiles.map(async (filePath) => {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                return `\n/* ${path.relative(SRC_DIR, filePath)} */\n${content}`;
            } catch (error) {
                console.warn(colors.yellow(`⚠️  Could not read: ${filePath}`));
                return '';
            }
        })
    );
    
    // Concatenate all contents
    const concatenated = contents.join('\n');
    
    // Write to temp file
    const tempFile = path.join(DIST_DIR, `${bundleName}.bundle.temp.js`);
    await fs.writeFile(tempFile, concatenated, 'utf-8');
    
    // Minify the concatenated bundle
    try {
        await esbuild.build({
            entryPoints: [tempFile],
            outfile: bundlePath,
            minify: true,
            target: 'es2020',
            format: 'esm',
            keepNames: true,
            logLevel: 'silent',
        });
        
        // Clean up temp file
        await fs.unlink(tempFile);
        
        return bundlePath;
    } catch (error) {
        console.error(colors.yellow(`⚠️  Error minifying bundle ${bundleName}:`), error.message);
        await fs.unlink(tempFile).catch(() => {});
        return null;
    }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/**
 * Main build process
 */
async function main() {
    console.log(colors.green('🚀 Starting Polypoint build process...\n'));
    
    const startTime = Date.now();
    
    // Clean dist directory
    console.log(colors.blue('🧹 Cleaning dist directory...'));
    await fs.rm(DIST_DIR, { recursive: true, force: true });
    await fs.mkdir(DIST_DIR, { recursive: true });
    
    // Step 1: Minify all individual files
    console.log(colors.blue('\n📝 Minifying individual files...'));
    const jsFiles = await getAllJsFiles(SRC_DIR);
    const filesToMinify = jsFiles.filter(f => !f.includes('files.json'));
    
    let successCount = 0;
    let totalOriginalSize = 0;
    let totalMinSize = 0;
    let totalGzSize = 0;
    
    for (const srcPath of filesToMinify) {
        const relativePath = path.relative(SRC_DIR, srcPath);
        const distPath = path.join(DIST_DIR, relativePath.replace('.js', '.min.js'));
        
        const success = await minifyFile(srcPath, distPath);
        
        if (success) {
            successCount++;
            
            // Get file sizes
            const [originalStat, minStat] = await Promise.all([
                fs.stat(srcPath),
                fs.stat(distPath)
            ]);
            
            totalOriginalSize += originalStat.size;
            totalMinSize += minStat.size;
            
            // Gzip the minified file
            const { gzSize } = await gzipFile(distPath);
            totalGzSize += gzSize;
            
            const savings = ((1 - minStat.size / originalStat.size) * 100).toFixed(1);
            const gzSavings = ((1 - gzSize / originalStat.size) * 100).toFixed(1);
            
            console.log(
                colors.green('  ✓'),
                colors.dim(relativePath.padEnd(40)),
                colors.dim(`${formatBytes(originalStat.size)} → ${formatBytes(minStat.size)} (${savings}%) → ${formatBytes(gzSize)}gz (${gzSavings}%)`)
            );
        }
    }
    
    console.log(colors.green(`\n✓ Minified ${successCount}/${filesToMinify.length} files`));
    console.log(colors.dim(`  Total: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalMinSize)} → ${formatBytes(totalGzSize)}gz`));
    
    // Step 2: Create bundle files
    console.log(colors.blue('\n📦 Creating bundle files...'));
    const filesConfig = await loadFilesJson();
    
    let bundleCount = 0;
    
    for (const [bundleName, entries] of Object.entries(filesConfig)) {
        const bundlePath = await createBundle(bundleName, entries, filesConfig);
        
        if (bundlePath) {
            bundleCount++;
            
            // Gzip the bundle
            const { originalSize, gzSize } = await gzipFile(bundlePath);
            const savings = ((1 - gzSize / originalSize) * 100).toFixed(1);
            
            console.log(
                colors.green('  ✓'),
                colors.dim(`${bundleName}.bundle.min.js`.padEnd(40)),
                colors.dim(`${formatBytes(originalSize)} → ${formatBytes(gzSize)}gz (${savings}%)`)
            );
        }
    }
    
    console.log(colors.green(`\n✓ Created ${bundleCount} bundles`));
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(colors.green(`\n✨ Build complete in ${duration}s`));
    console.log(colors.dim(`   Output directory: ${DIST_DIR}/`));
}

// Run the build
main().catch(error => {
    console.error(colors.yellow('\n❌ Build failed:'), error);
    process.exit(1);
});
