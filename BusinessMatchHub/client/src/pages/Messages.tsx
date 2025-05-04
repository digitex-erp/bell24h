import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Message, User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { RootState } from '@/store/store';

interface Contact {
  id: number;
  name: string;
  lastMessage?: string;
  unreadCount: number;
  companyName?: string;
}

interface MessageWithUser extends Message {
  senderName?: string;
}

const Messages: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  // Extract unique contacts from messages
  const contacts = React.useMemo(() => {
    if (!messages || !user) return [];
    
    const contactMap = new Map<number, Contact>();
    
    messages.forEach(message => {
      const contactId = message.senderId === user.id ? message.receiverId : message.senderId;
      
      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          id: contactId,
          name: `Contact ${contactId}`, // This would be replaced with actual user data
          unreadCount: message.senderId !== user.id && !message.isRead ? 1 : 0,
          lastMessage: message.content
        });
      } else {
        const contact = contactMap.get(contactId)!;
        if (message.senderId !== user.id && !message.isRead) {
          contact.unreadCount += 1;
        }
        // Update last message if this is more recent
        contact.lastMessage = message.content;
      }
    });
    
    return Array.from(contactMap.values());
  }, [messages, user]);

  // Filter messages for selected contact
  const contactMessages = React.useMemo(() => {
    if (!messages || !selectedContact) return [];
    
    return messages
      .filter(message => 
        (message.senderId === user?.id && message.receiverId === selectedContact.id) ||
        (message.receiverId === user?.id && message.senderId === selectedContact.id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedContact, user]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contactMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { receiverId: number; content: string; rfqId?: number }) => {
      const response = await apiRequest('POST', '/api/messages', message);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage('');
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      const response = await apiRequest('POST', '/api/messages/read', { messageIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Mark unread messages as read
    const unreadMessageIds = messages
      ?.filter(m => m.senderId === contact.id && m.receiverId === user?.id && !m.isRead)
      .map(m => m.id);
    
    if (unreadMessageIds && unreadMessageIds.length > 0) {
      markAsReadMutation.mutate(unreadMessageIds);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedContact.id,
      content: newMessage,
    });
  };

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Contacts list */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="pb-2">
                <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                {isLoadingMessages ? (
                  // Loading skeleton
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : contacts.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <i className="fas fa-comments text-gray-300 text-4xl mb-2"></i>
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                ) : (
                  // Contact list
                  <div className="space-y-1">
                    {contacts.map(contact => (
                      <div 
                        key={contact.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors
                          ${selectedContact?.id === contact.id ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {contact.name}
                          </div>
                          {contact.lastMessage && (
                            <div className="text-xs text-gray-500 truncate">
                              {contact.lastMessage}
                            </div>
                          )}
                        </div>
                        {contact.unreadCount > 0 && (
                          <div className="ml-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {contact.unreadCount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Message area */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {!selectedContact ? (
                // No contact selected state
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-comments text-primary-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                  <p className="text-gray-500 mt-1">Select a contact to start messaging</p>
                </div>
              ) : (
                <>
                  {/* Contact header */}
                  <CardHeader className="flex flex-row items-center border-b">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {selectedContact.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h2 className="text-lg font-medium text-gray-900">{selectedContact.name}</h2>
                      {selectedContact.companyName && (
                        <p className="text-xs text-gray-500">{selectedContact.companyName}</p>
                      )}
                    </div>
                  </CardHeader>
                
                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    {isLoadingMessages ? (
                      // Loading state
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <Skeleton className="h-10 w-3/4 rounded-lg" />
                        </div>
                        <div className="flex justify-end">
                          <Skeleton className="h-10 w-3/4 rounded-lg" />
                        </div>
                        <div className="flex justify-start">
                          <Skeleton className="h-10 w-1/2 rounded-lg" />
                        </div>
                      </div>
                    ) : contactMessages.length === 0 ? (
                      // Empty conversation state
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <i className="fas fa-paper-plane text-gray-300 text-4xl mb-2"></i>
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      // Message bubbles
                      <div className="space-y-4">
                        {contactMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div 
                                className={`text-xs mt-1 ${
                                  message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                
                  {/* Message input */}
                  <CardFooter className="border-t p-4">
                    <div className="flex items-center w-full">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        className="ml-2"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-paper-plane"></i>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
