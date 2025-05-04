import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { Send, User, Search } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const { getMessages, sendMessageMutation, markAsReadMutation } = useMessages();
  const { data: allMessages = [], isLoading } = getMessages();
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get unique users from messages
  const uniqueUsers = Array.from(new Set([
    ...allMessages.map(m => m.sender_id),
    ...allMessages.map(m => m.recipient_id)
  ])).filter(id => id !== user?.id);
  
  // Get messages for selected user
  const userMessages = allMessages.filter(m => 
    (m.sender_id === selectedUserId && m.recipient_id === user?.id) ||
    (m.sender_id === user?.id && m.recipient_id === selectedUserId)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  // Mark unread messages as read when viewing a conversation
  useEffect(() => {
    if (selectedUserId) {
      const unreadMessages = userMessages.filter(m => 
        m.status !== 'read' && m.recipient_id === user?.id
      );
      
      unreadMessages.forEach(message => {
        markAsReadMutation.mutate(message.id);
      });
    }
  }, [selectedUserId, userMessages]);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessages]);
  
  // Send message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId || !user) return;
    
    sendMessageMutation.mutate({
      sender_id: user.id,
      recipient_id: selectedUserId,
      content: messageText,
      status: 'sent'
    });
    
    setMessageText("");
  };
  
  // Filter users by search term
  const filteredUsers = uniqueUsers.filter(userId => {
    // In a real app, you would filter based on username
    return searchTerm ? userId.toString().includes(searchTerm) : true;
  });
  
  // Format date relative to now
  const formatMessageDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <MainLayout
      title="Messages"
      description="Communicate with buyers and suppliers."
    >
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow overflow-hidden">
        {/* Users list */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            {filteredUsers.map(userId => {
              const unreadCount = allMessages.filter(m => 
                m.sender_id === userId && 
                m.recipient_id === user?.id &&
                m.status !== 'read'
              ).length;
              
              // Find the most recent message for this user
              const latestMessage = [...allMessages]
                .filter(m => 
                  (m.sender_id === userId && m.recipient_id === user?.id) ||
                  (m.sender_id === user?.id && m.recipient_id === userId)
                )
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              
              return (
                <div 
                  key={userId}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${selectedUserId === userId ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedUserId(userId)}
                >
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        User {userId}
                      </p>
                      {latestMessage && (
                        <p className="text-xs text-gray-500">
                          {formatMessageDate(latestMessage.created_at)}
                        </p>
                      )}
                    </div>
                    {latestMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {latestMessage.sender_id === user?.id ? 'You: ' : ''}
                        {latestMessage.content}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      User {selectedUserId}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {userMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userMessages.map((message: Message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_id === user?.id 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id 
                              ? 'text-primary-100' 
                              : 'text-gray-500'
                          }`}>
                            {formatMessageDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <Textarea
                    className="flex-1 resize-none"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
