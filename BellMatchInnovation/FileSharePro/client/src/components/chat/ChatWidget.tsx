import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { User } from "@shared/schema";
import { ChatMessage } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";

interface ChatWidgetProps {
  user: User;
}

export default function ChatWidget({ user }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentChatUser, setCurrentChatUser] = useState<User | null>(null);
  const [notification, setNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { lastMessage } = useWebSocket();

  // Process incoming websocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === "new-message") {
      const messageData = lastMessage.data;
      
      // Only add messages meant for this user
      if (messageData.receiverId === user.id) {
        const newMsg: ChatMessage = {
          ...messageData,
          isCurrentUser: false,
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Show notification if chat is closed
        if (!isOpen) {
          setNotification(true);
        }
      }
    }
  }, [lastMessage, user.id, isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // For demo purposes, set a mock chat partner
  useEffect(() => {
    setCurrentChatUser({
      id: 2,
      username: "supplier1",
      name: "TechSupply Solutions",
      email: "tech@example.com",
      role: "supplier",
      company: "TechSupply Solutions Ltd.",
      avatar: "https://ui-avatars.com/api/?name=TechSupply+Solutions&background=random",
      password: ""
    });

    // Sample messages
    const sampleMessages: ChatMessage[] = [
      {
        id: 1,
        senderId: 2,
        receiverId: user.id,
        content: "Hello, I've reviewed your RFQ for industrial sensors. We have exactly what you need. When would be a good time to discuss specifications?",
        createdAt: new Date(Date.now() - 3600000),
        status: "read",
        isCurrentUser: false
      },
      {
        id: 2,
        senderId: user.id,
        receiverId: 2,
        content: "Hi there! Thanks for your response. Could you share more details about your production capacity?",
        createdAt: new Date(Date.now() - 1800000),
        status: "read",
        isCurrentUser: true
      }
    ];

    setMessages(sampleMessages);
  }, [user.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatUser) return;
    
    try {
      const messageData = {
        receiverId: currentChatUser.id,
        content: newMessage,
        rfqId: null,
        quoteId: null
      };
      
      const response = await apiRequest("POST", "/api/messages", messageData);
      const sentMessage = await response.json();
      
      // Add to messages with isCurrentUser flag
      const newMsg: ChatMessage = {
        ...sentMessage,
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotification(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-80">
          <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-medium">Messages</h3>
            <button 
              className="text-white focus:outline-none" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 scrollbar-hide" id="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-end mb-4 ${message.isCurrentUser ? 'justify-end' : ''}`}
              >
                {!message.isCurrentUser && (
                  <div className="flex-shrink-0 mr-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={currentChatUser?.avatar} 
                        alt={currentChatUser?.name || "User"} 
                      />
                      <AvatarFallback>
                        {getInitials(currentChatUser?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div className={`rounded-lg px-4 py-2 max-w-xs shadow-sm ${
                  message.isCurrentUser 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'bg-white text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isCurrentUser ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {formatDate(message.createdAt as string, 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="flex rounded-md shadow-sm">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Type a message..."
              />
              <Button 
                onClick={handleSendMessage}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center ml-auto relative"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          {notification && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500"></span>
          )}
        </button>
      )}
    </div>
  );
}
