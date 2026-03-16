import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { getCapability } from '../registry/index.js';
import { generateCapability } from '../generator/index.js';
import type { ProjectConfig } from '../types/index.js';

export async function addCommand(capabilityName: string) {
  const spinner = ora(`Adding ${capabilityName} capability...`).start();

  try {
    const configPath = path.join(process.cwd(), 'backcap.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: ProjectConfig = JSON.parse(configContent);

    const capability = getCapability(capabilityName);

    if (!capability) {
      spinner.fail(chalk.red(`Capability "${capabilityName}" not found in registry`));
      process.exit(1);
    }

    const capabilityDir = path.join(process.cwd(), 'capabilities', capabilityName);
    await generateCapability(capability, capabilityDir, config);

    if (!config.capabilities.includes(capabilityName)) {
      config.capabilities.push(capabilityName);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }

    spinner.succeed(chalk.green(`Added ${capabilityName} capability!`));

    console.log(chalk.gray('\nGenerated structure:'));
    console.log(chalk.gray(`  capabilities/${capabilityName}/`));
    console.log(chalk.gray(`    ├── spec.yaml`));
    console.log(chalk.gray(`    ├── core/`));
    console.log(chalk.gray(`    ├── ports/`));
    console.log(chalk.gray(`    ├── usecases/`));
    console.log(chalk.gray(`    └── skills/\n`));
  } catch (error) {
    spinner.fail(chalk.red('Error adding capability'));
    console.error(error);
    process.exit(1);
  }
}
