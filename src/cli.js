#!/usr/bin/env node

/**
 * Casio Text Replacer
 * Command-line tool
 * 
 * Author: Victor Lourme
 */

// Dependencies
const colors = require('colors');
const program = require('commander');
const texts = require('./commands/texts');
const interactive = require('./commands/interactive');

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
    .option('-r, --range', 'Choose a defined ranges for known systems')
    .option('-f, --from <address>', 'Start reading the buffer at certain address (e.g.: 0x01)')
    .option('-t, --to <address>', 'Read the buffer until a certain address (e.g.:0x9F)')
    .description('Get a list of texts in the selected area')
    .action(async (input, cmdObj) => await texts(input, cmdObj));

// Action: Interactive Edition
program
    .command('interactive <input>')
    .option('-a, --all', 'Read the entire file')
    .option('-r, --range', 'Choose a defined ranges for known systems')
    .option('-f, --from <address>', 'Start reading the buffer at certain address (e.g.: 0x01)')
    .option('-t, --to <address>', 'Read the buffer until a certain address (e.g.:0x9F)')
    .description('Read and edit texts one by one')
    .action(async (input, cmdObj) => await interactive(input, cmdObj, program));

// Parse program
program.parse(process.argv);