# Terminal Command Helper

A CLI tool to get shell commands from natural language queries using Claude.

## Installation

```bash
npm install -g .
```

## Usage

```bash
ch <your natural language query>
```

### Piping Multiple Commands

To pipe the output of multiple commands to `ch`, you can group them using curly braces `{}` and separate them with semicolons `;`. This will execute the commands sequentially and pipe the combined output to `ch`.

```bash
{ ls; ls node_modules; } | ch "your query"
```
