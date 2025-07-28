import React, { useState } from 'react';
import { AZRCoderProvider } from '../../../../contexts/AZRCoderContext';
import AZREditor from './AZREditor';

const AZREditorDemo: React.FC = () => {
  const [code, setCode] = useState(`// Welcome to AZR-CODER-7B Editor
// Try writing some code and use the toolbar above to analyze, complete, test, refactor, or document your code

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Try these features:
// 1. Click "Analyze" to analyze this code
// 2. Place cursor after "fibonacci(" and press Ctrl+Space for completions
// 3. Click "Generate Tests" to create test cases
// 4. Click "Refactor" to see optimization suggestions
// 5. Click "Document" to generate documentation`);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>AZR-CODER-7B Code Editor</h1>
      <p style={{ marginBottom: '20px' }}>
        A powerful code editor with AI-powered code analysis, completions, test generation, refactoring, and documentation.
      </p>
      
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <AZRCoderProvider>
          <AZREditor
            initialCode={code}
            onCodeChange={setCode}
            language="typescript"
            filePath="example.ts"
            height="600px"
            showControls={true}
          />
        </AZRCoderProvider>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>Features</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Code Analysis:</strong> Get insights into your code's quality, performance, and potential issues.</li>
          <li><strong>Smart Completions:</strong> AI-powered code completions with context awareness (Ctrl+Space).</li>
          <li><strong>Test Generation:</strong> Automatically generate test cases for your functions.</li>
          <li><strong>Code Refactoring:</strong> Get suggestions for improving your code's structure and performance.</li>
          <li><strong>Documentation:</strong> Generate comprehensive documentation for your code.</li>
        </ul>
        
        <h3 style={{ marginTop: '20px' }}>Keyboard Shortcuts</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><code>Ctrl+Enter</code>: Analyze code</li>
          <li><code>Ctrl+Space</code>: Trigger code completions</li>
        </ul>
      </div>
    </div>
  );
};

export default AZREditorDemo;
