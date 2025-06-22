# WordPress Docs MCP Server

[![npm version](https://badge.fury.io/js/wordpress-docs-claude-mcp.svg)](https://www.npmjs.com/package/wordpress-docs-claude-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **Model Context Protocol (MCP) server** that provides WordPress documentation and development tools for both **Claude Code** and **Claude Desktop**. Get instant access to WordPress.org documentation, WordPress VIP guides, and function references directly in your Claude conversations.

## 🚀 Quick Start

### Install via npm (Recommended)

```bash
npm install -g wordpress-docs-claude-mcp
```

### Configure for Claude Code

Add to your Claude Code MCP configuration file (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "wordpress-docs": {
      "command": "wordpress-docs-mcp"
    }
  }
}
```

### Configure for Claude Desktop

Add to your Claude Desktop configuration file:
- **macOS**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "wordpress-docs": {
      "command": "wordpress-docs-mcp"
    }
  }
}
```

### Restart Claude

Restart Claude Code or Claude Desktop to load the MCP server.

## 🛠️ Available Tools

### `hello_wp`
WordPress-themed greeting tool for testing MCP server connectivity.
- **Parameters**: `name` (required) - Name to greet with WordPress context

### `wp_search_docs`
Search WordPress.org developer documentation with filtering options.
- **Parameters**: 
  - `query` (required) - Search term for WordPress documentation
  - `type` (optional) - Content type: "posts", "functions", "hooks", "classes"

### `wp_vip_search`
Search WordPress VIP platform documentation for enterprise features.
- **Parameters**: 
  - `query` (required) - Search term for WordPress VIP documentation  
  - `section` (optional) - VIP section: "all", "getting-started", "infrastructure", "development", "content"

### `wp_function_lookup`
Get detailed information about specific WordPress functions, hooks, or classes.
- **Parameters**: 
  - `function_name` (required) - Exact name of the WordPress function, hook, or class

## 💡 Usage Examples

Once configured, you can ask Claude to use these tools naturally:

**Search Documentation:**
- "Search WordPress docs for custom post types"
- "Find WordPress VIP documentation about caching"
- "Look up information about REST API endpoints"

**Function Lookup:**
- "Look up the wp_enqueue_script function"
- "Find documentation for get_post"
- "What parameters does add_action take?"

**VIP-Specific Queries:**
- "Search VIP docs for deployment best practices"
- "Find VIP information about performance optimization"
- "Look up VIP security controls"

## 🔧 Development Setup

If you want to contribute or run from source:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/freibergergarcia/wordpress-docs-claude-mcp.git
   cd wordpress-docs-claude-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure Claude with local path:**
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

## 🧪 Testing

Test the server manually (requires `jq` for formatted output):

```bash
# List available tools
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | wordpress-docs-mcp | jq

# Test WordPress greeting
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "hello_wp", "arguments": {"name": "Developer"}}}' | wordpress-docs-mcp | jq

# Search WordPress documentation
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "wp_search_docs", "arguments": {"query": "REST API", "type": "posts"}}}' | wordpress-docs-mcp | jq

# Search WordPress VIP documentation
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "wp_vip_search", "arguments": {"query": "deployment"}}}' | wordpress-docs-mcp | jq

# Look up WordPress function
echo '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "wp_function_lookup", "arguments": {"function_name": "get_post"}}}' | wordpress-docs-mcp | jq
```

## 📚 Documentation

- **[MCP Architecture](./docs/mcp-architecture.md)** - Learn how MCP servers work, Node.js integration, and Claude communication
- **[Development Guide](./docs/development-guide.md)** - How to add new WordPress tools and development workflow

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **npm package**: [wordpress-docs-claude-mcp](https://www.npmjs.com/package/wordpress-docs-claude-mcp)
- **GitHub repository**: [freibergergarcia/wordpress-docs-claude-mcp](https://github.com/freibergergarcia/wordpress-docs-claude-mcp)
- **Issues**: [Report bugs or request features](https://github.com/freibergergarcia/wordpress-docs-claude-mcp/issues)

## ⚡ What's New

### Version 1.0.0
- ✅ WordPress.org documentation search with content type filtering
- ✅ WordPress VIP documentation search with web scraping fallback
- ✅ WordPress function lookup with direct URL scraping
- ✅ Comprehensive error handling and validation
- ✅ Support for both Claude Code and Claude Desktop
- ✅ Real-time documentation fetching (no cached/stale content)

---

**Made with ❤️ for the WordPress and Claude communities**
