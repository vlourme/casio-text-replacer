/**
 * Casio OS Text API
 * This class brings ability to read text from Casio OS, change it, understand its format, and more.
 * 
 * Author: Victor Lourme
 */

// Dependencies
const fs = require('fs');
const replace = require('buffer-replace');

// Export class
module.exports = class CasioTextAPI {
    /**
     * Initialize by setting a buffer
     * 
     * @param { Buffer } Buffer 
     */
    constructor(buffer) {
        // Save buffer
        this.buffer = buffer;

        // Read content from buffer
        this.original = this.read_text();

        // Copy for replacements
        this.text = Array.from(this.original);
    }

    /**
     * Get the format of the text
     * This will return special formatting with significant letters :
     * * X = Letter
     * * B = Simple line break (most likely this -> 00 20)
     * * A = Advanced line break (most likely this -> 00 20 20 00)
     * 
     * ! Deprecated, format is often wrong and this function is not used anymore in rendering process.
     * 
     * @returns {string} Format 
     */
    get_format() {
        // Prepare format
        var ret = "";

        // Iterate buffer
        for (var i = 0; i < this.buffer.length - 1; i++) {
            // Parse hex
            const hex = this.buffer.readInt8(i).toString(16);

            // Find hex format
            if (hex != 0) {
                // If next hex is a 00 -> Advanced break
                if (hex == "20" && this.buffer.readInt8(i + 1).toString(16) == 0) {
                    // Register advanced break
                    ret += "A";
                } else {
                    // Register letter
                    ret += "X";
                }
            } else {
                // If next hex is a 20 -> Simple break
                if (this.buffer.readInt8(i + 1).toString(16) == "20") {
                    // Register simple break
                    ret += "B";
                }
            }
        }

        // Return format 
        return ret;
    }

    /**
     * Read the text from buffer
     * 
     * @returns {array} Each element is a chain of text
     */
    read_text() {
        // Prepare return
        const ret = [];

        // Temporary variable
        let line = "";

        // Iterate buffer
        for (var i = 0; i <= this.buffer.length - 1; i++) {
            // Parse hex
            const number = this.buffer.readInt8(i);
            const hex = number.toString(16);

            // Find hex format
            if (hex != 0) {
                // If next hex is a 00 -> Advanced break
                if (hex == "20" && this.buffer.readInt8(i + 1).toString(16) == 0) {
                    // Increment to bypass next hex
                    i++;
                } else {
                    // Register letter
                    line += String.fromCharCode(number);
                }
            } else {
                if (this.buffer.readInt8(i + 1).toString(16) == "20") {
                    // Increment to bypass next hex
                    i++;
                }

                // Push the line
                ret.push(line);

                // Reset the line
                line = "";
            }
        }

        // Push the last line if available
        if (line)
            ret.push(line);

        // Return array of text
        return ret;
    }

    /**
     * Replace text at certain position
     * 
     * @param { int } pos 
     * @param { string } text 
     */
    replace_string(pos, text) {
        // Check if replacement can be made
        if (text.length > this.text[pos].length) {
            return false;
        }

        // Calculate necessary padding
        const spaces = this.text[pos].length - text.length;

        // Add the padding
        text += ' '.repeat(spaces);

        // Replace the text
        this.text[pos] = text;

        // Success
        return true;
    }

    /**
     * Get rendered buffer
     * 
     * @returns { Buffer } New buffer
     */
    render() {
        // Prepare response
        let ret = Buffer.from(this.buffer);

        // Iterate texts
        for (var i = 0; i < this.text.length; i++) {
            // Replace in the buffer
            ret = replace(ret, this.original[i], this.text[i]);
        }

        // Return response
        return ret;
    }
}