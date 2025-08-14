#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const modelMapping = {
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-1-20250805',
  haiku: 'claude-3-5-haiku-20241022'
};

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
  .option('model', {
    alias: 'm',
    type: 'string',
    description: 'Specify the Claude model to use',
    default: 'haiku'
  })
  .option('dry-run', {
    alias: 'd',
    type: 'boolean',
    description: 'Show the command that would be executed without actually executing it'
  })
  .argv;

const query = argv._.join(' ');

async function main() {
  let context = '';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let pipedInput = '';
  if (!process.stdin.isTTY) {
    for await (const line of rl) {
      pipedInput += line + '\n';
    }
  }

  if (pipedInput) {
    context += `\n\n---\nTerminal Output:\n${pipedInput}`;
  }

  if (argv.context) {
    const shell = process.env.SHELL;
    let historyFile;

    if (shell.includes('zsh')) {
      historyFile = path.join(os.homedir(), '.zsh_history');
    } else if (shell.includes('bash')) {
      historyFile = path.join(os.homedir(), '.bash_history');
    } else if (shell.includes('fish')) {
      historyFile = path.join(os.homedir(), '.local/share/fish/fish_history');
    } else {
      console.log(chalk.yellow('Could not determine shell type. Skipping history.'));
    }

    if (historyFile && fs.existsSync(historyFile)) {
      const history = fs.readFileSync(historyFile, 'utf-8').trim().split('\n');
      const lastLines = history.slice(-argv.lines).join('\n');
      context += `\n\n---\nTerminal History:\n${lastLines}`;
    } else {
      console.log(chalk.yellow('Could not find history file. Skipping history.'));
    }
  }

  if (argv.files) {
    const files = fs.readdirSync(process.cwd());
    context += `\n\n---\nFiles in current directory:\n${files.join('\n')}`;
  }

  const model = modelMapping[argv.model] || argv.model;

  const modifiedQuery = `${query}, just give the command, no commentary, inside of triple backticks and a bash header. Do not execute the command, just supply it. Do not look at the repo in any way, just answer the question based on the context given to you.`;

  const claudeCommand = `claude -p "${modifiedQuery}" --model ${model}`;

  console.log(chalk.yellow(`Executing command: ${claudeCommand}\n`));

  try {
    const output = execSync(claudeCommand, { input: context, encoding: 'utf-8' });
    const commandMatch = output.match(/```bash\n([\s\S]*?)\n```/);
    const command = commandMatch ? commandMatch[1].trim() : null;

    if (command) {
      if (argv.dryRun) {
        console.log(chalk.cyan('Command that would be executed:\n'));
        console.log(chalk.greenBright(`  ${command}\n`));
      } else {
        const confirmationRl = readline.createInterface({
          input: fs.createReadStream('/dev/tty'),
          output: process.stdout
        });

        console.log(chalk.cyan('Do you want to execute the following command?\n'));
        console.log(chalk.greenBright(`  ${command}\n`));

        confirmationRl.question(chalk.cyan('(y/n) '),(answer) => {
          if (answer.toLowerCase() === 'y') {
            try {
              console.log('\n');
              const commandOutput = execSync(command, { stdio: 'inherit' });
            } catch (error) {
              console.error(chalk.red(`\nError executing command: ${error}`));
            }
          }
          confirmationRl.close();
          process.exit(0);
        });
      }
    } else {
      console.log(chalk.red("Could not find a command to execute."));
    }

  } catch (error) {
    console.error(chalk.red(`\nError executing command: ${error}`));
  }
}

main();