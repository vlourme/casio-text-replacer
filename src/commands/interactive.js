// Dependencies
const fs = require('fs');
const colors = require('colors');
const bufferReplace = require('buffer-replace');
const prompts = require('prompts');
const API = require('../casio_text_api');
const offsets = JSON.parse(fs.readFileSync('./offsets.json'));

/**
 * Get texts from the binary
 * 
 * @param { String } input
 * @param { Object } cmdObj
 */
module.exports = async (input, cmdObj) => {
    // Check for input file
    if (!fs.existsSync(input)) {
        console.log('[!] Unexistant input file'.red.bold);
        process.exit(0);
    }

    // Log
    console.log('[*] Starting interactive mode...'.green)

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

    // Get area to edit
    let area;

    if (!cmdObj.all) {
        if (cmdObj.from != null && cmdObj.to != null) {
            area = buffer.slice(cmdObj.from, cmdObj.to);
        } else {
            console.log('[!] Please define start and end address.'.red.bold);
            process.exit();
        }
    }

    // Initialize API
    const api = new API(area);

    // Run async
    const edit = async () => {
        // Clear the console
        console.clear();

        // List texts
        console.log('[i] Texts found in the offset range:'.blue.italic)

        // Store choices
        let choices = [];

        for (var i = 0; i < api.text.length; i++) {
            // Display text
            console.log(i.toString().red.bold + ` - "`.grey + api.text[i].grey.bold + `" - ${api.text[i].length} chars `.grey)

            // Store choice
            choices.push({
                title: `Edit line n°${i} - "${api.text[i].grey}"`,
                value: i
            })
        }

        // Add exit and save option
        choices.push({
            title: 'Exit and save',
            value: api.text.length + 1
        });

        // Add simple exit
        choices.push({
            title: 'Exit without saving',
            value: api.text.length + 2
        });

        // Select
        const selection = await prompts({
            name: 'number',
            type: 'select',
            message: 'Make a selection',
            choices: choices,
        });

        // Handle selection
        if (selection.number == api.text.length + 2) { // Exit without saving signal
            console.log('[!] Exiting...'.red.bold);
            process.exit(0);
        } else if (selection.number == api.text.length + 1) { // Exit with saving
            // Ask for saving path
            const saving = await prompts({
                name: 'path',
                type: 'text',
                message: 'Please type the saving path',
                validate: value => {
                    if (fs.existsSync(value)) {
                        return 'A file with the same name already exists.';
                    } else {
                        return true;
                    }
                }
            })

            // Get new buffer
            const new_area = api.render();

            // Replace in original buffer
            const new_buf = bufferReplace(buffer, area, new_area)

            // Save buffer
            fs.writeFileSync(saving.path, new_buf);
        } else {
            // Clear the console
            console.clear();

            // Ask for new text
            const textPrompt = await prompts({
                type: 'text',
                name: 'text',
                message: `Write the new text (${api.text[selection.number].length} chars max)`,
                validate: value => {
                    if (value.length > api.text[selection.number].length)
                        return 'Too much characters!'
                    else
                        return true;
                }
            })

            // Replace text
            if (!api.replace_string(selection.number, textPrompt.text)) {
                console.log('[*] Hm, there was an error editing text.'.yellow);
            }

            // Recursive call to the beginning
            edit();
        }
    };

    // Launch edition
    edit();
};