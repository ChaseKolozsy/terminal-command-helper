#!/usr/bin/env node

import { exec } from 'child_process';

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Please provide a query. For example: ch view my docker containers');
  process.exit(1);
}

const claudeCommand = `claude -p "${query}"`;

exec(claudeCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(stdout.trim());
});