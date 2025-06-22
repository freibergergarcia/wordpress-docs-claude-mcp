# MCP Server Architecture

## What is an MCP Server?

A **Model Context Protocol (MCP) server** is a Node.js process that implements the MCP specification to extend Claude's capabilities with custom tools and data sources.

## How It Works

### Core Components

1. **Node.js Process**: Your MCP server runs as a separate Node.js process
2. **MCP Protocol**: Follows the Model Context Protocol specification for communication
3. **JSON-RPC Communication**: Uses JSON-RPC 2.0 over stdio (standard input/output)
4. **Tool Registration**: Exposes tools that Claude can discover and execute

### Communication Flow

```
Claude Client (Code/Desktop) ←─────────→ MCP Server (Node.js)
            │                                │
            │    1. Launch subprocess        │
            │ ─────────────────────────────→ │
            │                                │
            │    2. "tools/list"             │
            │ ─────────────────────────────→ │
            │    Tool definitions            │
            │ ←───────────────────────────── │
            │                                │
            │    3. "tools/call"             │
            │ ─────────────────────────────→ │
            │    Tool execution result       │
            │ ←───────────────────────────── │
```

### Integration with Claude

#### Claude Code
- Reads MCP configuration from `~/.claude/mcp.json`
- Launches your server: `node dist/index.js`
- Communicates via stdio transport

#### Claude Desktop
- Reads MCP configuration from platform-specific config file
- Same communication protocol as Claude Code
- Works identically across both clients

### JSON-RPC Protocol

Your server handles these key methods:

**tools/list** - Claude asks what tools are available:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**tools/call** - Claude executes a specific tool:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "hello_world",
    "arguments": {"name": "Claude"}
  }
}
```

### Server Lifecycle

1. **Startup**: Claude launches your Node.js process
2. **Handshake**: MCP protocol initialization
3. **Tool Discovery**: Claude calls `tools/list` to see available tools
4. **Tool Execution**: Claude calls `tools/call` as needed during conversation
5. **Shutdown**: Process terminates when Claude session ends

## Technical Architecture

### Our WordPress Docs MCP Server

```
src/index.ts
├── Server setup with @modelcontextprotocol/sdk
├── StdioServerTransport for communication
├── ListToolsRequestSchema handler (tool definitions)
└── CallToolRequestSchema handler (tool execution)
```

### Key Dependencies

- **@modelcontextprotocol/sdk**: Official MCP SDK for Node.js
- **TypeScript**: Type safety and modern JavaScript features
- **stdio transport**: Communication channel with Claude

This architecture allows you to create powerful extensions to Claude that can access external APIs, process data, and provide domain-specific functionality - all while maintaining security through the sandboxed subprocess model.