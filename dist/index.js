#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const server = new index_js_1.Server({
    name: "wordpress-docs-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("WordPress Docs MCP server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map