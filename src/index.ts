#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "wordpress-docs-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "hello_world",
        description: "A simple hello world tool to test MCP server functionality",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet",
            },
          },
        },
      },
      {
        name: "hello_wp",
        description: "WordPress-themed greeting tool for testing WordPress context",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name to greet with WordPress context",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "hello_world") {
    const nameArg = args?.name || "World";
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${nameArg}! This is your WordPress Docs MCP server working correctly.`,
        },
      ],
    };
  }

  if (name === "hello_wp") {
    const nameArg = args?.name;
    if (!nameArg || typeof nameArg !== 'string') {
      throw new Error('Name parameter is required and must be a string');
    }
    
    return {
      content: [
        {
          type: "text",
          text: `👋 Hello, ${nameArg}! Welcome to the WordPress ecosystem! 🚀\n\n` +
                `You're now connected to the WordPress Docs MCP server, ready to help with:\n` +
                `• WordPress Core documentation\n` +
                `• WordPress VIP platform guidance\n` +
                `• Development best practices\n` +
                `• Plugin and theme development\n\n` +
                `Happy coding with WordPress! 💙`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WordPress Docs MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});