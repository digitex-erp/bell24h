/**
 * Utility functions for code manipulation and analysis
 */

/**
 * Extracts the code block from a markdown string
 * @param markdown The markdown string containing code blocks
 * @param language The language of the code block to extract (optional)
 * @returns The extracted code or the original string if no code block is found
 */
export function extractCodeFromMarkdown(markdown: string, language?: string): string {
  if (!markdown) return '';
  
  // If no language is specified, match any code block
  const languagePattern = language ? `\\s*${language}\\s*` : '[^\\s]*';
  const codeBlockRegex = new RegExp(`\\\`\\\`\\\`${languagePattern}\\s*\n([\\s\\S]*?)\\n\\\`\\\`\\\``, 'g');
  
  const matches = codeBlockRegex.exec(markdown);
  return matches ? matches[1].trim() : markdown;
}

/**
 * Formats code with proper indentation
 * @param code The code to format
 * @param indentSize The number of spaces to use for indentation (default: 2)
 * @returns The formatted code
 */
export function formatCodeIndentation(code: string, indentSize: number = 2): string {
  if (!code) return '';
  
  const lines = code.split('\n');
  let indentLevel = 0;
  const indentStr = ' '.repeat(indentSize);
  
  return lines.map(line => {
    // Skip empty lines
    if (!line.trim()) return line;
    
    // Handle line comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return indentStr.repeat(indentLevel) + line.trimStart();
    }
    
    // Handle closing braces
    if (line.trim().startsWith('}') || line.trim().startsWith(')') || line.trim().startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Apply current indentation
    const indentedLine = indentStr.repeat(indentLevel) + line.trimStart();
    
    // Handle opening braces for next line
    if (line.endsWith('{') || line.endsWith('(') || line.endsWith('[')) {
      indentLevel++;
    }
    
    return indentedLine;
  }).join('\n');
}

/**
 * Extracts function/method signatures from code
 * @param code The code to analyze
 * @param language The programming language of the code
 * @returns An array of function/method signatures
 */
export function extractFunctionSignatures(code: string, language: string = 'typescript'): string[] {
  if (!code) return [];
  
  const signatures: string[] = [];
  
  // Simple regex patterns for different languages
  const patterns = {
    typescript: /(?:function\s+([^\s(]+)\s*\([^)]*\)|const\s+([^\s=]+)\s*=\s*\([^)]*\)\s*=>|class\s+([^\s{]+)[\s\S]*?\b(?:public|private|protected|static)?\s+([^\s(]+)\s*\([^)]*\))/g,
    javascript: /(?:function\s+([^\s(]+)\s*\([^)]*\)|const\s+([^\s=]+)\s*=\s*\([^)]*\)\s*=>|class\s+([^\s{]+)[\s\S]*?\b(?:public|private|protected|static)?\s+([^\s(]+)\s*\([^)]*\))/g,
    python: /(?:def\s+([^\s(]+)\s*\([^)]*\)|class\s+([^\s(:]+)\s*(?::[^:]+)?\s*:)/g,
  };
  
  const pattern = patterns[language as keyof typeof patterns] || /(?:function\s+([^\s(]+)\s*\([^)]*\)|const\s+([^\s=]+)\s*=\s*\([^)]*\)\s*=>|class\s+([^\s{]+))/g;
  
  let match;
  while ((match = pattern.exec(code)) !== null) {
    // The first non-undefined group is our match
    const signature = match.slice(1).find(group => group !== undefined);
    if (signature) {
      signatures.push(signature);
    }
  }
  
  return [...new Set(signatures)]; // Remove duplicates
}

/**
 * Counts the number of lines of code (LOC) in a string
 * @param code The code to analyze
 * @returns The number of non-empty lines
 */
export function countLinesOfCode(code: string): number {
  if (!code) return 0;
  return code.split('\n').filter(line => line.trim().length > 0).length;
}

/**
 * Detects the programming language from a file extension
 * @param filename The filename or extension (with or without leading dot)
 * @returns The detected language or 'plaintext' if unknown
 */
export function detectLanguage(filename: string): string {
  if (!filename) return 'plaintext';
  
  // Remove leading dot if present
  const ext = filename.startsWith('.') ? filename.slice(1) : filename;
  
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    
    // HTML/CSS
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    
    // Java
    'java': 'java',
    'class': 'java',
    'jar': 'java',
    
    // C/C++
    'c': 'c',
    'h': 'c',
    'cpp': 'cpp',
    'hpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    
    // C#
    'cs': 'csharp',
    
    // Go
    'go': 'go',
    
    // Rust
    'rs': 'rust',
    
    // Ruby
    'rb': 'ruby',
    
    // PHP
    'php': 'php',
    'phtml': 'php',
    
    // Shell
    'sh': 'shell',
    'bash': 'bash',
    'zsh': 'bash',
    
    // SQL
    'sql': 'sql',
    
    // JSON/YAML/XML
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
  };
  
  return languageMap[ext.toLowerCase()] || 'plaintext';
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes The size in bytes
 * @param decimals The number of decimal places to show
 * @returns A formatted string (e.g., "1.5 KB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
