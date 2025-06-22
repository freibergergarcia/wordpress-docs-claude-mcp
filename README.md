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

1. **Find your project path:**
   ```bash
   pwd  # Run this in your project directory
   ```

2. **Create/edit the MCP configuration file** (`~/.claude/mcp.json`):
   ```json
   {
     "mcpServers": {
       "wordpress-docs": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/absolute/path/to/wordpress-docs-claude-mcp"
       }
     }
   }
   ```
   Replace `/absolute/path/to/wordpress-docs-claude-mcp` with your actual project path.

3. **Restart Claude Code** (if it's currently running)

4. **Test in a conversation:**
   - "What MCP tools are available?"
   - "Use the hello_wp tool to greet [your name]"

### For Claude Desktop

1. **Edit the Claude Desktop configuration file:**
   - **macOS**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

2. **Add the server configuration:**
   ```json
   {
     "mcpServers": {
       "wordpress-docs": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/absolute/path/to/wordpress-docs-claude-mcp"
       }
     }
   }
   ```
   Replace `/absolute/path/to/wordpress-docs-claude-mcp` with your actual project path.

3. **Restart Claude Desktop**

## Available Tools

### hello_world
- **Description**: A simple test tool to verify the MCP server is working
- **Parameters**: 
  - `name` (optional): Name to greet

### hello_wp
- **Description**: WordPress-themed greeting tool for testing WordPress context
- **Parameters**: 
  - `name` (required): Name to greet with WordPress context

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

Test the hello_wp tool:
```bash
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "hello_wp", "arguments": {"name": "Developer"}}}' | node dist/index.js | jq
```