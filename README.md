# Terminal Command Helper

A CLI tool to get shell commands from natural language queries using Claude, Qwen, or Gemini.

## Installation

```bash
npm install -g .
```

## Usage

```bash
ch <your natural language query>
```

### Model Selection

By default, the tool uses Claude's `haiku` model. You can specify a different model using the `--model` or `-m` flag:

For Claude models:
```bash
ch -m sonnet <your natural language query>
ch -m opus <your natural language query>
ch -m haiku <your natural language query>
```

For Qwen models:
```bash
ch -m qwen <your natural language query>
ch -m qwen-max <your natural language query>
ch -m qwen-plus <your natural language query>
ch -m qwen-turbo <your natural language query>
```

For Gemini models:
```bash
ch -m gemini <your natural language query>
ch -m gemini-pro <your natural language query>
ch -m gemini-ultra <your natural language query>
ch -m gemini-flash <your natural language query>
```

## Comparison to Cursor IDE's CMD+K

| Feature | Cursor IDE's CMD+K | `ch` |
| :--- | :--- | :--- |
| **Integration** | Tightly integrated into the IDE | Loosely integrated into the terminal |
| **Context** | Full project context | Explicitly provided context |
| **Functionality** | Code generation, refactoring, commands | Commands |
| **Flexibility** | Less flexible | More flexible |
| **Platform** | Cursor IDE only | Any terminal, any platform |
