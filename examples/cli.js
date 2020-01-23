// Import deps
const fs = require('fs');
const colors = require('colors');
const API = require('../src/casio_text_api');

// Instance api
console.log('[i] Casio Text Replacer API by @vlourme'.green.bold)
console.log('[*] Loading initial buffer ...'.blue);
const api = new API('./enter.bin');

// Get text
console.log('[*] Text found in this buffer:'.blue);
api.text.forEach(text => {
    console.log(('- ' + text).grey);
});

// Replace text
console.log('[*] Replacing first line by "Short text" ...'.blue)
api.replace_string(0, 'Short text');

// Get new buffer
console.log('[*] Getting new rendered buffer ...'.blue)
const buf = api.render();

// Save buffer
fs.writeFileSync('./enter_new.bin', buf);

console.log('|> Buffer has been saved.'.green.bold)