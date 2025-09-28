#!/usr/bin/env node

/**
 * Direct Git MCP Server - Bypasses q prefix issue
 * Model Context Protocol server for direct Git operations
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ErrorCode, ListResourcesRequestSchema, ListToolsRequestSchema, McpError, ReadResourceRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DirectGitMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "direct-git-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "git_status",
            description: "Get the current Git repository status (bypasses q prefix)",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository (defaults to current directory)"
                }
              }
            }
          },
          {
            name: "git_add",
            description: "Add files to Git staging area",
            inputSchema: {
              type: "object",
              properties: {
                files: {
                  type: "string",
                  description: "Files to add (use . for all files)"
                },
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                }
              },
              required: ["files"]
            }
          },
          {
            name: "git_commit",
            description: "Create a Git commit",
            inputSchema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Commit message"
                },
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                }
              },
              required: ["message"]
            }
          },
          {
            name: "git_push",
            description: "Push changes to remote repository",
            inputSchema: {
              type: "object",
              properties: {
                branch: {
                  type: "string",
                  description: "Branch to push (defaults to main)"
                },
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                }
              }
            }
          },
          {
            name: "git_pull",
            description: "Pull changes from remote repository",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                }
              }
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        const repoPath = args?.path || process.cwd();

        switch (name) {
          case "git_status":
            return await this.handleGitStatus(repoPath);
          case "git_add":
            return await this.handleGitAdd(repoPath, args.files);
          case "git_commit":
            return await this.handleGitCommit(repoPath, args.message);
          case "git_push":
            return await this.handleGitPush(repoPath, args.branch || 'main');
          case "git_pull":
            return await this.handleGitPull(repoPath);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error.message}`);
      }
    });
  }

  async handleGitStatus(repoPath) {
    try {
      const output = execSync('git status --porcelain', {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: output || "Repository is clean"
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get Git status: ${error.message}`);
    }
  }

  async handleGitAdd(repoPath, files) {
    try {
      const output = execSync(`git add ${files}`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: `Files added successfully: ${files}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to add files: ${error.message}`);
    }
  }

  async handleGitCommit(repoPath, message) {
    try {
      const output = execSync(`git commit -m "${message}"`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: "Commit created successfully:\n" + output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  async handleGitPush(repoPath, branch) {
    try {
      const output = execSync(`git push origin ${branch}`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully pushed to ${branch}\n` + output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  async handleGitPull(repoPath) {
    try {
      const output = execSync('git pull origin main', {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: "Successfully pulled changes:\n" + output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Direct Git MCP server running on stdio");
  }
}

// Start the server
const server = new DirectGitMCPServer();
server.run().catch(console.error);