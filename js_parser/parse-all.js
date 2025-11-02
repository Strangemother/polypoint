#!/usr/bin/env node

/*
Parse all JavaScript files in the point_src directory

Usage:
    node parse-all.js
    node parse-all.js --filter="point,stage,zoom"
*/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parseFile, listAvailableFiles } from './parse-file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POINT_SRC_DIR = path.resolve(__dirname, '../point_src');


function parseAllFiles(filterPattern = null) {
    console.log('Parsing all JavaScript files in point_src directory...\n');
    
    // Get all JS files
    let files = fs.readdirSync(POINT_SRC_DIR)
        .filter(f => f.endsWith('.js'))
        .sort();
    
    // Apply filter if provided
    if (filterPattern) {
        const patterns = filterPattern.split(',').map(p => p.trim().toLowerCase());
        files = files.filter(f => {
            const fname = f.toLowerCase();
            return patterns.some(p => fname.includes(p));
        });
        console.log(`Filtered to ${files.length} files matching: ${filterPattern}\n`);
    }
    
    console.log(`Processing ${files.length} files...\n`);
    
    let successCount = 0;
    let failCount = 0;
    const failed = [];
    
    files.forEach((file, index) => {
        console.log(`[${index + 1}/${files.length}] Processing: ${file}`);
        try {
            parseFile(file);
            successCount++;
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
            failCount++;
            failed.push({ file, error: error.message });
        }
        console.log('');
    });
    
    console.log('='.repeat(60));
    console.log(`Summary: ${successCount} succeeded, ${failCount} failed`);
    
    if (failed.length > 0) {
        console.log('\nFailed files:');
        failed.forEach(({ file, error }) => {
            console.log(`  - ${file}: ${error}`);
        });
    }
    
    return { successCount, failCount, failed };
}


function main() {
    const args = process.argv.slice(2);
    let filterPattern = null;
    
    // Parse arguments
    for (const arg of args) {
        if (arg.startsWith('--filter=')) {
            filterPattern = arg.split('=')[1];
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Parse All Files - Batch processor for Polypoint JavaScript files

Usage:
    node parse-all.js                       Parse all JS files
    node parse-all.js --filter="pattern"    Parse only matching files

Examples:
    node parse-all.js
    node parse-all.js --filter="point,stage"
    node parse-all.js --filter="event"

The filter accepts comma-separated patterns and matches any file containing
those substrings (case-insensitive).
            `);
            process.exit(0);
        }
    }
    
    try {
        parseAllFiles(filterPattern);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}


if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { parseAllFiles };
