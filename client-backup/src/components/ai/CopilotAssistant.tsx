'use client';

import { useCopilotChat } from '@copilotkit/react-core';
import { MdFilledButton } from '@material/web/button/filled-button';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';
import { MdCard } from '@material/web/card/card';
import { MdCircularProgress } from '@material/web/progress/circular-progress';
import { useState, useRef, useEffect } from 'react';

// Ensure Material Web Component modules are loaded for them to be defined
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/card/card.js';
import '@material/web/progress/circular-progress.js';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function CopilotAssistant() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, submitMessage, isLoading } = useCopilotChat({
    // The endpoint is configured in CopilotProvider, but can be specified here too.
    // id: 'bell24h-dedicated-assistant', // Unique ID for this chat instance
    initialMessages: [
      {
        id: 'init-message',
        role: 'assistant',
        content: 'Welcome to the Bell24H AI Assistant! How can I assist you with your B2B marketplace needs today?'
      }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await submitMessage(input);
    setInput('');
  };

  return (
    <MdCard style={{ width: '100%', maxWidth: '800px', margin: '20px auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', minHeight: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', backgroundColor: 'var(--md-sys-color-surface-container-low)' }}>
        <h2 style={{ margin: '0', fontSize: '1.3rem', fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>Bell24H AI Assistant</h2>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--md-sys-color-surface-bright)' }}>
        {(messages as ChatMessage[]).map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <div // Using a div instead of MdCard for individual messages for more control
              style={{
                padding: '12px 16px',
                borderRadius: msg.role === 'user'
                  ? '20px 20px 4px 20px' // User message bubble
                  : '4px 20px 20px 20px', // Assistant message bubble
                backgroundColor: msg.role === 'user'
                  ? 'var(--md-sys-color-primary)'
                  : 'var(--md-sys-color-surface-container-high)',
                color: msg.role === 'user'
                  ? 'var(--md-sys-color-on-primary)'
                  : 'var(--md-sys-color-on-surface-variant)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.95rem' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '10px', paddingTop: '10px' }}>
            <MdCircularProgress indeterminate style={{ width: '28px', height: '28px' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', padding: '16px 20px', borderTop: '1px solid var(--md-sys-color-outline-variant)', gap: '12px', alignItems: 'center', backgroundColor: 'var(--md-sys-color-surface-container-low)' }}
      >
        <MdOutlinedTextField
          label="Type your message..."
          value={input}
          onInput={(e: any) => setInput(e.target.value)} // Standard HTML event for onInput
          style={{ flexGrow: 1 }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />
        <MdFilledButton type="submit" disabled={isLoading || !input.trim()}>
          Send
        </MdFilledButton>
      </form>
    </MdCard>
  );
}
