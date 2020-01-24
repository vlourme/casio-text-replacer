#!/usr/bin/env node
/**
 * Casio Text Replacer
 * Command-line tool
 * 
 * Author: Victor Lourme
 */

// Dependencies
const fs = require('fs');
const prompts = require('prompts');
const colors = require('colors');
const program = require('commander');
const API = require('./casio_text_api');

// Program opening
console.log('[i] CTR-tool v1.0 by Victor Lourme'.cyan.bold);
console.log('[!] Warning: Please do not use this tool to cheat.'.red.bold);

// Program definitions
program.version('1.0')
program.description('Text Replacement Tool for Casio 35+E/75+E calculators OS')

// Options
program.option('-o, --output <path>', 'Output file for buffer');

// Action: Get texts
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

// Action: Interactive Edition
program
    .command('interactive <input>')
    .option('-a, --all', 'Read the entire file')
    .option('-f, --from <address>', 'Start reading the buffer at certain address (e.g.: 0x01)')
    .option('-t, --to <address>', 'Read the buffer until a certain address (e.g.:0x9F)')
    .description('Read and edit texts one by one')
    .action((input, cmdObj) => {
        // Check for input file
        if (!fs.existsSync(input)) {
            console.log('[!] Unexistant input file'.red.bold);
            process.exit(0);
        }

        // Log
        console.log('[*] Starting interactive mode...'.green)
        console.log('[!] Don\'t forget to add --output option to save the render.'.grey.bold)

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

        // Run async
        const edit = (async () => {
            // List texts
            console.log('[i] Foreach line, select if you want to edit it:'.blue.italic)

            for (var i = 0; i < api.text.length; i++) {
                // Display text
                console.log(`- "${api.text[i]}" - ${api.text[i].length} chars `.grey)

                // Run prompt
                const response = await prompts({
                    type: 'confirm',
                    name: 'prompt',
                    message: 'Edit this text?',
                    initial: false
                });

                if (response.prompt) {
                    // Ask for new text
                    const textPrompt = await prompts({
                        type: 'text',
                        name: 'text',
                        message: `Write the new text (${api.text[i].length} chars max)`,
                        validate: value => {
                            if (value.length >= api.text[i].length)
                                return 'Too much characters!'
                            else
                                return true;
                        }
                    })

                    // Replace text
                    if (api.replace_string(i, textPrompt.text)) {
                        console.log('[*] Successfully replaced !'.green);
                    } else {
                        console.log('[*] Error replacing text :/'.yellow);
                    }
                }
            }

            // If saving is enabled
            if (program.output) {
                // Review edits
                console.log('[*] Here is the final list after editing:'.blue.italic)

                // Display list
                api.text.forEach(text => {
                    console.log(`- ${text}`.grey)
                });

                // Ask for re-edition
                const reedit = await prompts({
                    type: 'confirm',
                    message: 'Do you want to re-edit?',
                    name: 'prompt',
                    initial: false
                });

                if (reedit.prompt) {
                    console.log('[*] Relaunch edition mode...'.yellow.bold)

                    // Re-edit
                    edit();
                }

                // Render file
                if (program.output) {
                    // Get new buffer
                    const new_buf = api.render();

                    // Save buffer
                    fs.writeFileSync(program.output, new_buf);
                }
            }
        });

        // Launch edition
        edit();
    });

// Parse program
program.parse(process.argv);