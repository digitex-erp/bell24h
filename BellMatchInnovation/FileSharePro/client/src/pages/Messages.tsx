import { useState, useEffect, useRef } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatMessage } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface MessagesProps {
  user: User;
}

interface Contact {
  id: number;
  name: string;
  company?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  online?: boolean;
  role: string;
}

export default function Messages({ user }: MessagesProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { lastMessage } = useWebSocket();
  
  // Simulate fetching contacts
  useEffect(() => {
    // This would be fetched from the API in a real implementation
    const mockContacts: Contact[] = [
      {
        id: 2,
        name: "TechSupply Solutions",
        company: "TechSupply Solutions Ltd.",
        avatar: "https://ui-avatars.com/api/?name=TechSupply+Solutions&background=random",
        lastMessage: "We have exactly what you need. When would be a good time to discuss specifications?",
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 1,
        online: true,
        role: "supplier"
      },
      {
        id: 3,
        name: "GlobalSemi Inc.",
        company: "GlobalSemi Incorporated",
        avatar: "https://ui-avatars.com/api/?name=GlobalSemi+Inc&background=random",
        lastMessage: "Thank you for your inquiry. We can offer competitive pricing for your PCB requirements.",
        lastMessageTime: new Date(Date.now() - 86400000),
        unreadCount: 0,
        online: false,
        role: "supplier"
      },
      {
        id: 4,
        name: "ElectroTech",
        company: "ElectroTech Solutions",
        avatar: "https://ui-avatars.com/api/?name=ElectroTech&background=random",
        lastMessage: "Our team is reviewing your RFQ and will get back to you shortly.",
        lastMessageTime: new Date(Date.now() - 172800000),
        unreadCount: 0,
        online: true,
        role: "supplier"
      }
    ];
    
    setContacts(mockContacts);
    // Set the first contact as selected by default
    if (mockContacts.length > 0 && !selectedContact) {
      setSelectedContact(mockContacts[0]);
    }
  }, [selectedContact]);
  
  // Watch for new messages from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === "new-message") {
      const messageData = lastMessage.data;
      
      // Only process if it's for the current user
      if (messageData.receiverId === user.id || messageData.senderId === user.id) {
        const newMsg: ChatMessage = {
          ...messageData,
          isCurrentUser: messageData.senderId === user.id
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Update the contact's last message if from the currently selected contact
        if (selectedContact && 
            (messageData.senderId === selectedContact.id || 
             messageData.receiverId === selectedContact.id)) {
          // This would trigger a re-fetch of contacts in a real implementation
        }
      }
    }
  }, [lastMessage, user.id, selectedContact]);
  
  // Fetch messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedContact) {
        try {
          const response = await apiRequest("GET", `/api/messages/${selectedContact.id}`);
          const messagesData = await response.json();
          
          // Add isCurrentUser flag
          const formattedMessages = messagesData.map((msg: ChatMessage) => ({
            ...msg,
            isCurrentUser: msg.senderId === user.id
          }));
          
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      }
    };
    
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact, user.id]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Reset unread count (would be an API call in real implementation)
    setContacts(prev => 
      prev.map(c => 
        c.id === contact.id 
          ? { ...c, unreadCount: 0 } 
          : c
      )
    );
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    try {
      const messageData = {
        receiverId: selectedContact.id,
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
      
      // Update the contact's last message
      setContacts(prev => 
        prev.map(c => 
          c.id === selectedContact.id 
            ? { 
                ...c, 
                lastMessage: newMessage, 
                lastMessageTime: new Date() 
              } 
            : c
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Contacts List */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredContacts.map((contact) => (
            <div 
              key={contact.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-primary-50' : ''}`}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500">
                      {contact.lastMessageTime ? formatDate(contact.lastMessageTime, 'h:mm a') : ''}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{contact.company}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{contact.lastMessage}</p>
                </div>
                {contact.unreadCount && contact.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs">
                      {contact.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No contacts found
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                  <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedContact.online ? 'Online' : 'Offline'} • {selectedContact.company}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.isCurrentUser && (
                      <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-end">
                        <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                        <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.isCurrentUser 
                          ? 'bg-primary-500 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none shadow'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.createdAt as string, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start a conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a contact</h3>
              <p className="text-gray-500">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
