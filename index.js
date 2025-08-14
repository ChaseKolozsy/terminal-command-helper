#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';
import chalk from 'chalk';

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log(chalk.red('Please provide a query. For example: ch view my docker containers'));
  process.exit(1);
}

const modifiedQuery = `${query}, just give the command, no commentary, inside of triple backticks and a bash header`;

const claudeCommand = `claude -p \"${modifiedQuery}\"`;

console.log(chalk.yellow(`Executing command: ${claudeCommand}\n`));

try {
  const output = execSync(claudeCommand, { encoding: 'utf-8' });
  const command = output.match(/```bash\n(.*)\n```/s)[1].trim();

  if (command) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(chalk.cyan('Do you want to execute the following command?\n'));
    console.log(chalk.greenBright(`  ${command}\n`));

    rl.question(chalk.cyan('(y/n) '), (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          console.log('\n');
          const commandOutput = execSync(command, { stdio: 'inherit' });
        } catch (error) {
          console.error(chalk.red(`\nError executing command: ${error}`));
        }
      }
      rl.close();
    });
  } else {
    console.log(chalk.red("Could not find a command to execute."));
  }

} catch (error) {
  console.error(chalk.red(`\nError executing command: ${error}`));
}