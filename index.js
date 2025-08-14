#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Please provide a query. For example: ch view my docker containers');
  process.exit(1);
}

const modifiedQuery = `${query}, just give the command, no commentary, inside of triple backticks and a bash header`;

const claudeCommand = `claude -p "${modifiedQuery}"`;

console.log(`Executing command: ${claudeCommand}`);

try {
  const output = execSync(claudeCommand, { encoding: 'utf-8' });
  const command = output.match(/```bash\n(.*)\n```/s)[1].trim();

  if (command) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`Execute the following command? (y/n) \n${command}\n`, (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          const commandOutput = execSync(command, { encoding: 'utf-8' });
          console.log(commandOutput.trim());
        } catch (error) {
          console.error(`Error executing command: ${error}`);
        }
      }
      rl.close();
    });
  } else {
    console.log("Could not find a command to execute.");
  }

} catch (error) {
  console.error(`Error executing command: ${error}`);
}
