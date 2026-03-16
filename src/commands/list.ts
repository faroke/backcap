import chalk from 'chalk';
import { getRegistry } from '../registry/index.js';

export async function listCommand() {
  console.log(chalk.blue.bold('\n📦 Available Capabilities\n'));

  const registry = getRegistry();

  const categories = Object.keys(registry);

  for (const category of categories) {
    console.log(chalk.yellow.bold(`\n${category.toUpperCase()}`));
    const capabilities = registry[category as keyof typeof registry];

    for (const cap of capabilities) {
      console.log(chalk.gray(`  • ${cap.name}`) + chalk.dim(` - ${cap.description}`));
    }
  }

  console.log('\n');
}
