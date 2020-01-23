/**
 * Casio Text Replacer
 * Command-line tool
 * 
 * Author: Victor Lourme
 */

// Dependencies
const fs = require('fs');
const colors = require('colors');
const program = require('commander');
const API = require('./casio_text_api');

// Program opening
console.log('[i] CTR-tool v1.0 by Victor Lourme'.cyan.bold);
console.log('[!] Warning: Please do not use this tool to cheat.'.red.bold);

// Program definitions
program.version('1.0')
program.description('Text Replacement Tool for Casio 35+E/75+E calculators OS')

// Get text
program
    .command('texts <input>')
    .option('-a, --all', 'Read the entire file')
    .option('-f, --from <address>', 'Start reading the buffer at certain address (e.g.: 0x01)')
    .option('-t, --to <address>', 'Read the buffer until a certain address (e.g.:0x9F)')
    .description('Get a list of texts in the selected area')
    .action((input, cmdObj) => {
        // Check for input file
        if (!fs.existsSync(input)) {
            console.log('[!] Unexistant input file'.red.bold);
            process.exit(0);
        }

        // Get the area
        let buffer = fs.readFileSync(input);

        if (!cmdObj.all) {
            if (cmdObj.from != null && cmdObj.to != null) {
                buffer = buffer.slice(cmdObj.from, cmdObj.to);
            } else {
                console.log('[!] Please define start and end address.'.red.bold);
                process.exit();
            }
        }

        // Initialize API
        const api = new API(buffer);

        // List texts
        console.log('[i] Lines in the selected area:'.blue.italic)
        api.text.forEach(text => {
            console.log(`- ${text}`.grey)
        });
    });

// Parse program
program.parse(process.argv);