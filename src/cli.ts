#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('backcap')
  .description('Backend Capability Registry for TypeScript')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Backcap project')
  .action(initCommand);

program
  .command('add <capability>')
  .description('Add a capability to your project')
  .action(addCommand);

program
  .command('list')
  .description('List available capabilities')
  .action(listCommand);

program.parse();
