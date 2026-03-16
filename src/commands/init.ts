import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ProjectConfig } from '../types/index.js';

export async function initCommand() {
  console.log(chalk.blue.bold('\n🚀 Welcome to Backcap!\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: 'my-backend',
    },
    {
      type: 'list',
      name: 'runtime',
      message: 'Runtime?',
      choices: ['node', 'bun', 'deno'],
      default: 'node',
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Framework?',
      choices: ['none', 'nextjs', 'express', 'fastify', 'nestjs'],
      default: 'none',
    },
    {
      type: 'list',
      name: 'orm',
      message: 'ORM?',
      choices: ['prisma', 'drizzle', 'none'],
      default: 'prisma',
    },
  ]);

  const config: ProjectConfig = {
    name: answers.name,
    runtime: answers.runtime,
    framework: answers.framework,
    orm: answers.orm,
    capabilities: [],
  };

  const projectDir = path.join(process.cwd(), answers.name);

  try {
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.join(projectDir, 'capabilities'), { recursive: true });

    await fs.writeFile(
      path.join(projectDir, 'backcap.json'),
      JSON.stringify(config, null, 2)
    );

    console.log(chalk.green('\n✓ Project initialized successfully!'));
    console.log(chalk.gray(`\nNext steps:`));
    console.log(chalk.gray(`  cd ${answers.name}`));
    console.log(chalk.gray(`  npx backcap add authentication`));
    console.log(chalk.gray(`  npx backcap add cart\n`));
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error);
    process.exit(1);
  }
}
