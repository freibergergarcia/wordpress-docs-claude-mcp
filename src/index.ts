#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as cheerio from "cheerio";

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
      {
        name: "wp_search_docs",
        description: "Search WordPress.org developer documentation",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term for WordPress documentation",
            },
            type: {
              type: "string",
              enum: ["posts", "functions", "hooks", "classes"],
              description: "Type of content to search for",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "wp_vip_search",
        description: "Search WordPress VIP platform documentation",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term for WordPress VIP documentation",
            },
            section: {
              type: "string",
              enum: ["all", "getting-started", "infrastructure", "development", "content"],
              description: "VIP documentation section to focus search on",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "wp_function_lookup",
        description: "Look up detailed information about WordPress functions, hooks, or classes",
        inputSchema: {
          type: "object",
          properties: {
            function_name: {
              type: "string",
              description: "Exact name of the WordPress function, hook, or class to look up",
            },
          },
          required: ["function_name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

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

  if (name === "wp_search_docs") {
    const query = args?.query;
    const type = args?.type || "posts";
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    try {
      const apiUrl = `https://developer.wordpress.org/wp-json/wp/v2/${type}`;
      const response = await axios.get(apiUrl, {
        params: {
          search: query,
          per_page: 5,
          _fields: 'id,title,excerpt,link,content'
        },
        timeout: 10000,
      });

      const results = response.data;
      
      if (!results || results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `🔍 No results found for "${query}" in WordPress.org ${type} documentation.\n\nTry:\n• Different search terms\n• Checking spelling\n• Using broader terms`,
            },
          ],
        };
      }

      const formattedResults = results.map((item: any, index: number) => {
        const title = item.title?.rendered || 'Untitled';
        const excerpt = item.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';
        const content = item.content?.rendered?.replace(/<[^>]*>/g, '').substring(0, 200) || '';
        const link = item.link || '';
        
        return `## ${index + 1}. ${title}\n\n${excerpt || content}...\n\n🔗 [Read more](${link})`;
      }).join('\n\n---\n\n');

      return {
        content: [
          {
            type: "text",
            text: `# WordPress.org Documentation Search Results\n\n🔍 Found ${results.length} results for "${query}" in ${type}:\n\n${formattedResults}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error searching WordPress.org documentation: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check your connection.`,
          },
        ],
      };
    }
  }

  if (name === "wp_vip_search") {
    const query = args?.query;
    const section = args?.section || "all";
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    try {
      // First try the VIP API (though we know it's empty)
      const apiUrl = 'https://docs.wpvip.com/wp-json/wp/v2/posts';
      const apiResponse = await axios.get(apiUrl, {
        params: {
          search: query,
          per_page: 5,
          _fields: 'id,title,excerpt,link,content'
        },
        timeout: 5000,
      });

      // If API returns results, use them (unlikely but good to check)
      if (apiResponse.data && apiResponse.data.length > 0) {
        const results = apiResponse.data;
        const formattedResults = results.map((item: any, index: number) => {
          const title = item.title?.rendered || 'Untitled';
          const excerpt = item.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';
          const link = item.link || '';
          
          return `## ${index + 1}. ${title}\n\n${excerpt}...\n\n🔗 [Read more](${link})`;
        }).join('\n\n---\n\n');

        return {
          content: [
            {
              type: "text",
              text: `# WordPress VIP Documentation Search Results\n\n🏢 Found ${results.length} results for "${query}" in VIP docs:\n\n${formattedResults}`,
            },
          ],
        };
      }

      // API returned no results, fall back to web scraping VIP's search
      const searchUrl = `https://docs.wpvip.com/?s=${encodeURIComponent(query)}`;
      const searchResponse = await axios.get(searchUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WordPress-Docs-MCP-Server/1.0.0'
        }
      });

      const $ = cheerio.load(searchResponse.data);
      const searchResults: any[] = [];

      // Extract search results from VIP's search page
      $('.search-results article, .post, .entry').each((index, element) => {
        if (index >= 5) return false; // Limit to 5 results
        
        const $el = $(element);
        const title = $el.find('h1, h2, h3, .entry-title, .post-title').first().text().trim();
        const link = $el.find('a').first().attr('href') || '';
        const excerpt = $el.find('.excerpt, .entry-content, .post-content, p').first().text().trim().substring(0, 200);
        
        if (title && (link.includes('docs.wpvip.com') || link.startsWith('/'))) {
          const fullLink = link.startsWith('/') ? `https://docs.wpvip.com${link}` : link;
          searchResults.push({ title, link: fullLink, excerpt });
        }
      });

      if (searchResults.length > 0) {
        const formattedResults = searchResults.map((item, index) => {
          return `## ${index + 1}. ${item.title}\n\n${item.excerpt}...\n\n🔗 [Read more](${item.link})`;
        }).join('\n\n---\n\n');

        return {
          content: [
            {
              type: "text",
              text: `# WordPress VIP Documentation Search Results\n\n🏢 Found ${searchResults.length} results for "${query}" in VIP docs:\n\n${formattedResults}\n\n💡 **About WordPress VIP**: Enterprise-grade WordPress hosting with advanced security, performance, and support.`,
            },
          ],
        };
      }

      // No results found in either API or web scraping
      return {
        content: [
          {
            type: "text",
            text: `🔍 No results found for "${query}" in WordPress VIP documentation.\n\nTry:\n• Different search terms\n• Checking spelling\n• Using broader terms\n• Searching for VIP-specific topics like "deployment", "caching", "scaling"\n\n📚 You can browse the full VIP documentation at [docs.wpvip.com](https://docs.wpvip.com)`,
          },
        ],
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error searching WordPress VIP documentation: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check your connection.`,
          },
        ],
      };
    }
  }

  if (name === "wp_function_lookup") {
    const functionName = args?.function_name;
    
    if (!functionName || typeof functionName !== 'string') {
      throw new Error('Function name parameter is required and must be a string');
    }

    try {
      // Try direct URL scraping from WordPress.org function reference
      const functionUrl = `https://developer.wordpress.org/reference/functions/${functionName}/`;
      const response = await axios.get(functionUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WordPress-Docs-MCP-Server/1.0.0'
        }
      });

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);
      
      // Extract function information
      const description = $('.description p').first().text().trim();
      const syntax = $('.source-code-links code').text().trim() || 
                    $('pre.wp-block-code code').first().text().trim();
      
      // Extract parameters
      const parameters: string[] = [];
      $('.parameters .parameter').each((_, element) => {
        const paramName = $(element).find('.parameter-name').text().trim();
        const paramType = $(element).find('.parameter-type').text().trim();
        const paramDesc = $(element).find('.parameter-description').text().trim();
        if (paramName) {
          parameters.push(`**${paramName}** (${paramType}): ${paramDesc}`);
        }
      });

      // Extract return value
      const returnValue = $('.return .return-description').text().trim();

      if (description || syntax || parameters.length > 0) {
        let functionDoc = `# ${functionName}() - WordPress Function Reference\n\n`;
        
        if (description) {
          functionDoc += `## Description\n${description}\n\n`;
        }
        
        if (syntax) {
          functionDoc += `## Syntax\n\`\`\`php\n${syntax}\n\`\`\`\n\n`;
        }
        
        if (parameters.length > 0) {
          functionDoc += `## Parameters\n${parameters.join('\n')}\n\n`;
        }
        
        if (returnValue) {
          functionDoc += `## Return Value\n${returnValue}\n\n`;
        }
        
        functionDoc += `🔗 [Full Documentation](${functionUrl})\n\n`;
        functionDoc += `📚 **Note**: This information is scraped from WordPress.org developer documentation.`;

        return {
          content: [
            {
              type: "text",
              text: functionDoc,
            },
          ],
        };
      }
    } catch (error) {
      // If direct scraping fails, fall back to search
      if (error instanceof Error && error.message.includes('404')) {
        // Function page doesn't exist, try search fallback
        try {
          const searchUrl = 'https://developer.wordpress.org/wp-json/wp/v2/posts';
          const searchResponse = await axios.get(searchUrl, {
            params: {
              search: functionName,
              per_page: 3,
              _fields: 'id,title,excerpt,link'
            },
            timeout: 10000,
          });

          const results = searchResponse.data;
          
          if (results && results.length > 0) {
            const formattedResults = results.map((item: any, index: number) => {
              const title = item.title?.rendered || 'Documentation';
              const excerpt = item.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';
              const link = item.link || '';
              
              return `## ${index + 1}. ${title}\n\n${excerpt}...\n\n🔗 [Read more](${link})`;
            }).join('\n\n---\n\n');

            return {
              content: [
                {
                  type: "text",
                  text: `# Search Results for "${functionName}"\n\n` +
                        `🔍 No direct function reference found, but here are related results:\n\n${formattedResults}\n\n` +
                        `💡 **Tip**: The function might not exist or could be spelled differently.`,
                },
              ],
            };
          }
        } catch (searchError) {
          // Search also failed, return error
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `🔍 No documentation found for "${functionName}"\n\n` +
                  `This could mean:\n` +
                  `• The function name might be misspelled\n` +
                  `• It might be a plugin-specific function\n` +
                  `• It could be a newer function not yet documented\n` +
                  `• Try searching with wp_search_docs for broader results\n\n` +
                  `📚 You can also check the [WordPress Code Reference](https://developer.wordpress.org/reference/) directly.`,
          },
        ],
      };
    }
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