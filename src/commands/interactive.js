// Dependencies
const fs = require('fs');
const colors = require('colors');
const prompts = require('prompts');
const API = require('../casio_text_api');
const offsets = JSON.parse(fs.readFileSync('./offsets.json'));

/**
 * Get texts from the binary
 * 
 * @param { String } input
 * @param { Object } cmdObj
 * @param { Object } program
 */
module.exports = async (input, cmdObj, program) => {
    // Check for input file
    if (!fs.existsSync(input)) {
        console.log('[!] Unexistant input file'.red.bold);
        process.exit(0);
    }

    // Log
    console.log('[*] Starting interactive mode...'.green)
    console.log('[!] Don\'t forget to add --output option to save the render.'.grey.bold)

    // Choose ranges
    if (cmdObj.range) {
        const prompt = await prompts({
            type: 'select',
            name: 'choice',
            message: 'Choose text to edit',
            choices: offsets
        });

        // Set range
        cmdObj.from = Number(prompt.choice.from);
        cmdObj.to = Number(prompt.choice.to);
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

    // Run async
    const edit = (async () => {
        // List texts
        console.log('[i] Foreach line, select if you want to edit it:'.blue.italic)

        for (var i = 0; i < api.text.length; i++) {
            // Display text
            console.log(`- "`.grey + api.text[i].grey.bold + `" - ${api.text[i].length} chars `.grey)

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
};