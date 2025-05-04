import React, { useState, useRef, useEffect } from 'react';
import { useProcurementChatbot } from '../../hooks/use-procurement-chatbot';
import { ChatAction } from '../../lib/openai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Send, X, RefreshCw, ChevronRight } from 'lucide-react';

interface ChatInterfaceProps {
  userId?: number;
  minimizable?: boolean;
  initialOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
}

export function ChatInterface({
  userId,
  minimizable = true,
  initialOpen = false,
  position = 'bottom-right',
  title = 'Procurement Assistant'
}: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [inputValue, setInputValue] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    actions,
    error,
    sendMessage,
    clearMessages,
    executeAction
  } = useProcurementChatbot(userId);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  // Render chat messages
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 p-4">
          <p>Hi there! I'm your procurement assistant.</p>
          <p className="mt-2">How can I help you today?</p>
        </div>
      );
    }

    return messages.map((message, index) => (
      <div
        key={index}
        className={`mb-4 ${
          message.role === 'user' ? 'self-end' : 'self-start'
        }`}
      >
        <div className="flex items-start gap-2">
          {message.role !== 'user' && (
            <Avatar className="w-8 h-8">
              <span className="text-xs font-semibold">AI</span>
            </Avatar>
          )}
          
          <div
            className={`px-4 py-2 rounded-2xl max-w-[80%] ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {message.content}
          </div>
          
          {message.role === 'user' && (
            <Avatar className="w-8 h-8">
              <span className="text-xs font-semibold">You</span>
            </Avatar>
          )}
        </div>
      </div>
    ));
  };

  // Render action buttons
  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-sm font-medium text-gray-500">Suggested actions:</p>
        {actions.map((action: ChatAction, index: number) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="justify-start gap-2"
            onClick={() => executeAction(action)}
          >
            <ChevronRight className="h-4 w-4" />
            {action.description}
          </Button>
        ))}
      </div>
    );
  };

  // Render the minimized button
  if (!isOpen) {
    return (
      <Button
        className={`fixed ${getPositionClasses(position)} shadow-md rounded-full h-14 w-14 p-0`}
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open Chat</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 8H19C20.1 8 21 8.9 21 10V16C21 17.1 20.1 18 19 18H17V22L13 18H9C8.45 18 7.95 17.8 7.6 17.45M7 16V3C7 1.9 7.9 1 9 1H17C18.1 1 19 1.9 19 5V6M7 16H5C3.9 16 3 15.1 3 14V8C3 6.9 3.9 6 5 6H7V16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    );
  }

  return (
    <Card
      className={`fixed ${getPositionClasses(
        position
      )} shadow-lg w-80 sm:w-96 max-h-[500px] flex flex-col`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="New conversation"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">New conversation</span>
            </Button>
            {minimizable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Minimize</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea
          ref={scrollAreaRef as any}
          className="h-[300px] pr-4"
        >
          <div className="flex flex-col">
            {renderMessages()}
            {isLoading && (
              <div className="self-start flex items-center text-gray-500 gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            {error && (
              <div className="self-start bg-red-100 text-red-800 rounded-lg p-2 mt-2 text-sm">
                {error}
              </div>
            )}
            {renderActions()}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

// Helper function to get position classes
function getPositionClasses(position: string): string {
  switch (position) {
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    default:
      return 'bottom-4 right-4';
  }
}