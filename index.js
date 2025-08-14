#!/usr/bin/env node

import { execSync } from 'child_process';

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Please provide a query. For example: ch view my docker containers');
  process.exit(1);
}

const claudeCommand = `claude -p "${query}"`;

console.log(`Executing command: ${claudeCommand}`);

try {
  const output = execSync(claudeCommand, { encoding: 'utf-8' });
  console.log(output.trim());
} catch (error) {
  console.error(`Error executing command: ${error}`);
}