#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const argv = yargs(hideBin(process.argv))
  .option('context', {
    alias: 'c',
    type: 'boolean',
    description: 'Include the last 10 lines of terminal history as context'
  })
  .option('lines', {
    alias: 'l',
    type: 'number',
    description: 'Specify the number of lines of terminal history to include (requires -c)',
    default: 10
  })
  .option('files', {
    alias: 'f',
    type: 'boolean',
    description: 'Include the list of files and directories in the current directory as context'
  })
  .argv;

const query = argv._.join(' ');

if (!query) {
  console.log(chalk.red('Please provide a query. For example: ch view my docker containers'));
  process.exit(1);
}

let context = '';

if (argv.context) {
  const historyFile = path.join(os.homedir(), '.bash_history'); // a more robust solution is needed here
  if (fs.existsSync(historyFile)) {
    const history = fs.readFileSync(historyFile, 'utf-8').trim().split('\n');
    const lastLines = history.slice(-argv.lines).join('\n');
    context += `\n\n---\nTerminal History:\n${lastLines}`;
  }
}

if (argv.files) {
  const files = fs.readdirSync(process.cwd());
  context += `\n\n---\nFiles in current directory:\n${files.join('\n')}`;
}

const modifiedQuery = `${query}, just give the command, no commentary, inside of triple backticks and a bash header ${context}`;

const claudeCommand = `claude -p "${modifiedQuery}"`;

console.log(chalk.yellow(`Executing command: ${claudeCommand}\n`));

try {
  const output = execSync(claudeCommand, { encoding: 'utf-8' });
  const commandMatch = output.match(/```bash\n([\s\S]*?)\n```/);
  const command = commandMatch ? commandMatch[1].trim() : null;

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
