#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var init_js_1 = require("./commands/init.js");
var add_js_1 = require("./commands/add.js");
var list_js_1 = require("./commands/list.js");
var program = new commander_1.Command();
program
    .name('backcap')
    .description('Backend Capability Registry for TypeScript')
    .version('0.1.0');
program
    .command('init')
    .description('Initialize a new Backcap project')
    .action(init_js_1.initCommand);
program
    .command('add <capability>')
    .description('Add a capability to your project')
    .action(add_js_1.addCommand);
program
    .command('list')
    .description('List available capabilities')
    .action(list_js_1.listCommand);
program.parse();
