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
 */
module.exports = async (input, cmdObj) => {
    // Check for input file
    if (!fs.existsSync(input)) {
        console.log('[!] Unexistant input file'.red.bold);
        process.exit(0);
    }

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

    // List texts
    console.log('[i] Lines in the selected area:'.blue.italic)

    api.text.forEach(text => {
        console.log(`- "`.grey + text.grey.bold + `" - ${text.length} chars `.grey)
    });
}