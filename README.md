# WordPress Docs MCP Server

A Model Context Protocol (MCP) server that provides WordPress documentation and development tools for both Claude Code and Claude Desktop.

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### For Claude Code

Add the following to your Claude Code MCP configuration file (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "wordpress-docs": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "."
    }
  }
}
```

### For Claude Desktop

Add the following to your Claude Desktop configuration file:
- **macOS**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wordpress-docs": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "."
    }
  }
}
```

## Available Tools

### hello_world
- **Description**: A simple test tool to verify the MCP server is working
- **Parameters**: 
  - `name` (optional): Name to greet

## Documentation

- **[MCP Architecture](./docs/mcp-architecture.md)** - Learn how MCP servers work, Node.js integration, and Claude communication
- **[Development Guide](./docs/development-guide.md)** - How to add new WordPress tools and development workflow

## Development

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the built server

## Testing

Test the server manually (use `| jq` for nicely formatted output):
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js | jq
```

Test the hello_world tool:
```bash
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "hello_world", "arguments": {"name": "Claude"}}}' | node dist/index.js | jq
```