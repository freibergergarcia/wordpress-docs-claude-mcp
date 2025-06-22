# Development Guide

## Adding New WordPress Tools

### • Define Your Tool

Add tool definition to the `ListToolsRequestSchema` handler in `src/index.ts`:

```typescript
{
  name: "wp_search_docs",
  description: "Search WordPress documentation",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query for WordPress docs"
      },
      source: {
        type: "string",
        enum: ["core", "vip"],
        description: "Documentation source to search"
      }
    },
    required: ["query"]
  }
}
```

### • Implement Tool Logic

Add tool execution to the `CallToolRequestSchema` handler:

```typescript
if (name === "wp_search_docs") {
  const { query, source = "core" } = args;
  
  // Your implementation here
  const results = await searchWordPressDocs(query, source);
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${results.length} results for "${query}"`
      }
    ]
  };
}
```

### • Development Workflow

#### Setup Development Environment
```bash
npm run dev  # Runs with tsx for hot reload
```

#### Testing Your Tools
```bash
# Test tool listing
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js | jq

# Test tool execution
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "your_tool", "arguments": {"param": "value"}}}' | node dist/index.js | jq
```

#### Build and Test
```bash
npm run build   # Compile TypeScript
npm run start   # Run compiled version
```

## Code Structure

### Recommended Organization

```
src/
├── index.ts              # Main server entry point
├── tools/
│   ├── wordpress-core.ts # WordPress core documentation tools
│   ├── wordpress-vip.ts  # WordPress VIP specific tools
│   └── utils.ts         # Shared utilities
└── types/
    └── wordpress.ts      # TypeScript type definitions
```

### Tool Implementation Pattern

```typescript
// tools/wordpress-core.ts
export interface WordPressSearchResult {
  title: string;
  url: string;
  excerpt: string;
}

export async function searchWordPressDocs(
  query: string
): Promise<WordPressSearchResult[]> {
  // Implementation here
}

// In main index.ts
import { searchWordPressDocs } from './tools/wordpress-core.js';
```

## Best Practices

### Error Handling
Always wrap tool execution in try-catch:

```typescript
if (name === "wp_search_docs") {
  try {
    const results = await searchWordPressDocs(args.query);
    return { content: [{ type: "text", text: results }] };
  } catch (error) {
    return { 
      content: [{ 
        type: "text", 
        text: `Error: ${error.message}` 
      }],
      isError: true
    };
  }
}
```

### Input Validation
Validate required parameters:

```typescript
if (!args.query || typeof args.query !== 'string') {
  throw new Error('Query parameter is required and must be a string');
}
```

### Response Formatting
Structure responses consistently:

```typescript
return {
  content: [
    {
      type: "text",
      text: "# WordPress Documentation Results\n\n" + 
            results.map(r => `## ${r.title}\n${r.excerpt}\n[Read more](${r.url})`).join('\n\n')
    }
  ]
};
```

## Testing Integration

### With Claude Code
- Update your `~/.claude/mcp.json` configuration
- Restart Claude Code
- Test tools in a conversation

### Manual Testing
Use the command line examples above to test JSON-RPC communication directly.

## WordPress API Integration

### WordPress.org REST API
```typescript
const response = await fetch(`https://wordpress.org/wp-json/wp/v2/posts?search=${query}`);
const posts = await response.json();
```

### WordPress VIP Documentation
Consider scraping or API access patterns for VIP-specific documentation.

## Adding External Dependencies

```bash
npm install axios          # For HTTP requests
npm install cheerio        # For HTML parsing
npm install @types/node    # TypeScript definitions
```

Remember to rebuild after adding dependencies:
```bash
npm run build
```