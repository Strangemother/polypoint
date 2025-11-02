#!/usr/bin/env node

/*
Node.js file parser - command-line version of file-parser.js

This script processes JavaScript source files from the polypoint point_src directory,
parses them using Acorn.js, and saves the AST tree to the docs/trees directory.

Usage:
    node parse-file.js point.js
    node parse-file.js ../point_src/stage.js
    node parse-file.js --list
*/

import * as acorn from 'acorn';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default paths (relative to js_parser directory)
const POINT_SRC_DIR = path.resolve(__dirname, '../point_src');
const TREES_OUTPUT_DIR = path.resolve(__dirname, '../docs/trees');


class TreeReader {

    constructor() {
        this.comments = [];
        this.ast = null;
        this.result = null;
    }

    readText(text, filename = 'unknown.js') {
        /* Parse JavaScript text and return the structured result */
        this.comments = [];
        const ast = this.parseText(text);
        this.ast = ast;
        let finishedNodes = this.readNodeProgram(ast);

        // split classes and [other stuff]
        let classes = {};
        let notClasses = {};

        let dmap = {
            'default': (item) => {
                notClasses[item.name] = item;
            },

            'ClassDeclaration': (item) => {
                classes[item.name] = item;
                delete item.type;
            }
        };

        finishedNodes.forEach((e, i, a) => {
            let stackFunc = dmap[e.type];
            if (stackFunc == undefined) {
                stackFunc = dmap['default'];
            }

            stackFunc(e);
        });

        /* Cross reference super properties and methods. */
        const mapped = new Map(Object.entries(classes));
        Object.values(classes).forEach((e, i, a) => {
            let v = mapped.get(e.superClassName);
            if (v) {
                e.superObjectName = e.superClassName;
            }
        });

        // Inject comments to the correct nodes
        // snip source code of each method.
        this.result = {
            classes,
            notClasses
        };

        return this.result;
    }

    readNodeProgram(ast) {
        /* The first node, or _root_ of the tree. */
        return ast.body.map((n, i, a) => {
            return this.readNode(n, i, a, ast);
        });
    }

    stashComment(block, text, start, end, startLoc, currentLoc) {
        this.comments.push({
            block,
            text,
            start,
            end,
            startLoc,
            currentLoc
        });
    }

    parseText(text) {
        // https://github.com/acornjs/acorn/tree/master/acorn/#interface
        const tree = this;
        const stash = tree.stashComment.bind(tree);
        return acorn.parse(text, {
            ecmaVersion: 'latest',
            locations: true,
            onComment: function (block, text, start, end, startLoc, currentLoc) {
                stash(block, text, start, end, startLoc, currentLoc);
                /*
                block:  true if the comment is a block comment,
                        false if it is a line comment.
                text:   The content of the comment.
                start:  Character offset of the start of the comment.
                end:    Character offset of the end of the comment.
                 */
            }
        });
    }

    readNode(node, index, items, ast) {
        let n = node.type;
        // readNodeClassDeclaration
        let fname = `readNode${n}`;
        if (this[fname] == undefined) {
            // Silently skip certain common node types that we don't need to process
            // These are still captured in the full AST, just not in the simplified result
            const silentSkip = [
                'VariableDeclaration',
                'ExpressionStatement', 
                'EmptyStatement',
                'ForInStatement',
                'ForOfStatement',
                'ForStatement',
                'IfStatement',
                'WhileStatement',
                'DoWhileStatement',
                'SwitchStatement',
                'TryStatement',
                'ThrowStatement',
                'ReturnStatement',
                'BreakStatement',
                'ContinueStatement',
                'BlockStatement'
            ];
            if (!silentSkip.includes(n)) {
                console.log('skip', n);
            }
            return { action: 'skipped', type: n };
        }

        return this[fname].apply(this, arguments);
    }

    readNodeFunctionDeclaration(node, index, items, ast) {
        /* Read a function definition, e.g:

            function foo(a,b){}

        ---

        Node:

            docs/notes/acorn-function-declaration.js
        */

        const name = node.id.name;
        return {
            name,
            type: 'function',
            isAsync: node.async,
            isExpression: node.expression,
            start: node.start,
            end: node.end
        };
    }

    readNodeClassDeclaration(node, index, items, ast) {
        /* Read a class definition,
            + Methods
            + Properties
        */
        const name = node.id.name;
        const superClassName = node.superClass?.name;

        // readNodeMethodDefinition
        const classDeclaration = node.body;
        const bodyItems = classDeclaration.body.map((n, i, a) => {
            return this.readNode(n, i, a, node, ast);
        });

        let methods = {};
        let properties = {};
        let dmap = {
            'property': properties,
            'method': methods
        };
        // split methods and properties
        bodyItems.forEach((e) => {
            let { isStatic, start, end } = e;
            dmap[e.type][e.name] = { isStatic, start, end };
        });

        return {
            type: node.type,
            name,
            superClassName,
            methods,
            properties
        };
    }

    readNodeMethodDefinition(node, index, items, parentNode, tree) {
        /* Read a single method definition. e.g.

            class MyClass {
                methodDef() {} // method definition
            }
        */
        return {
            name: node.key.name,
            type: 'method',
            isStatic: node.static,
            start: node.start,
            end: node.end
        };
    }

    readNodePropertyDefinition(node, index, items, parentNode, tree) {
        return {
            name: node.key.name,
            type: 'property',
            isStatic: node.static,
            start: node.start,
            end: node.end
        };
    }

    getNodeMethods(classBodyNode) {
        /* return a dictionary of method definitions. the key being the
        method name.
            const methods = this.getNodeMethods(node.body)
        */
        let methods = {};
        for (let node of classBodyNode.body) {
            if (node.type != 'MethodDefinition') {
                continue;
            }
            let res = this.getMethodInfo(node);
            methods[res.name] = res;
        }

        return methods;
    }

    getMethodInfo(node) {
        /* return the information for a method. */
        return {
            name: node.key.name,
            isStatic: node.static,
            start: node.start,
            end: node.end
        };
    }
}


function parseFile(filePath, outputDir = TREES_OUTPUT_DIR) {
    /* Parse a JavaScript file and save the tree output */
    
    // Resolve the full path
    let fullPath;
    if (path.isAbsolute(filePath)) {
        fullPath = filePath;
    } else if (fs.existsSync(filePath)) {
        fullPath = path.resolve(filePath);
    } else {
        // Try in point_src directory
        fullPath = path.resolve(POINT_SRC_DIR, filePath);
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found: ${fullPath}`);
        process.exit(1);
    }

    console.log(`Processing: ${fullPath}`);
    
    // Read the file
    const content = fs.readFileSync(fullPath, 'utf8');
    const filename = path.basename(fullPath);
    
    // Parse with TreeReader
    const reader = new TreeReader();
    reader.readText(content, filename);
    
    // Create output structure matching the expected format
    const output = {
        comments: reader.comments,
        ast: reader.ast,
        info: {
            filename: filename,
            path: fullPath,
            size: content.length,
            parsed_date: new Date().toISOString()
        }
    };
    
    // Determine output filename
    const baseName = filename.replace('.js', '');
    const outputFilename = `${baseName}-js-tree.json`;
    const outputPath = path.join(outputDir, outputFilename);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the output
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 4));
    
    const outputSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`✓ Created: ${outputPath} (${outputSize} KB)`);
    console.log(`  - ${reader.comments.length} comments`);
    console.log(`  - ${Object.keys(reader.result.classes).length} classes`);
    console.log(`  - ${Object.keys(reader.result.notClasses).length} other top-level items`);
    
    return outputPath;
}


function listAvailableFiles() {
    /* List all JavaScript files in the point_src directory */
    console.log(`\nAvailable JavaScript files in ${POINT_SRC_DIR}:`);
    console.log('='.repeat(60));
    
    const files = fs.readdirSync(POINT_SRC_DIR)
        .filter(f => f.endsWith('.js'))
        .sort();
    
    files.forEach(file => {
        const fullPath = path.join(POINT_SRC_DIR, file);
        const stats = fs.statSync(fullPath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`  ${file.padEnd(30)} (${size.padStart(8)} KB)`);
    });
    
    console.log(`\nTotal: ${files.length} files`);
}


function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
Usage:
    node parse-file.js <filename>           Parse a specific file
    node parse-file.js --list               List available files
    node parse-file.js --help               Show this help

Examples:
    node parse-file.js point.js
    node parse-file.js stage.js
    node parse-file.js ../point_src/zoom.js
    node parse-file.js --list
        `);
        process.exit(0);
    }
    
    const command = args[0];
    
    if (command === '--list' || command === '-l') {
        listAvailableFiles();
        process.exit(0);
    }
    
    if (command === '--help' || command === '-h') {
        console.log(`
Polypoint JavaScript Parser - Node.js Edition

This tool parses JavaScript files from the point_src directory and generates
AST tree files compatible with the Python documentation generator.

Usage:
    node parse-file.js <filename>           Parse a specific file
    node parse-file.js --list               List available files

Examples:
    node parse-file.js point.js
    node parse-file.js stage.js
    node parse-file.js events.js

Output:
    Tree files are saved to: ${TREES_OUTPUT_DIR}
    Format: <basename>-js-tree.json
        `);
        process.exit(0);
    }
    
    // Parse the specified file
    try {
        parseFile(command);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}


// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { TreeReader, parseFile, listAvailableFiles };
