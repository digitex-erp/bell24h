import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Send, 
  Paperclip, 
  Info, 
  MoreVertical,
  File,
  FileText,
  Video,
  Image as ImageIcon
} from "lucide-react";
import { formatDatetime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/context/websocket-context";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { user } = useAuth();
  const { sendMessage } = useWebSocket();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/messages/conversations"],
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages/conversation", activeConversationId],
    enabled: !!activeConversationId,
  });

  const activeConversation = conversations.find((conv: any) => conv.id === activeConversationId) || null;

  // Set first conversation as active by default
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!activeConversationId) return;

    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      formData.append("conversationId", activeConversationId.toString());
      if (attachment) {
        formData.append("attachment", attachment);
      }

      // Using XMLHttpRequest for form data upload instead of fetch
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/messages", true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.withCredentials = true;
      
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
          // Success - clear inputs
          setNewMessage("");
          setAttachment(null);
          
          // Notify recipient via WebSocket
          const recipientId = activeConversation.participant.id;
          sendMessage({
            type: "new_message",
            data: {
              recipientId,
              conversationId: activeConversationId,
              senderId: user?.id,
              content: newMessage
            }
          });
        } else {
          toast({
            title: "Error sending message",
            description: "Please try again later",
            variant: "destructive",
          });
        }
      };
      
      xhr.onerror = function() {
        toast({
          title: "Error sending message",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      };
      
      xhr.send(formData);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAttachment(files[0]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-4 w-4" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">Communicate with suppliers and buyers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-primary-50 p-3 rounded-full">
                  <Send className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No Conversations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start communicating with suppliers and buyers by sending messages related to your RFQs.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conversation: any) => (
                  <li 
                    key={conversation.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                      activeConversationId === conversation.id ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-800">
                          {conversation.participant.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${
                            conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {conversation.participant.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDatetime(conversation.lastMessageAt).split(',')[0]}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage.length > 25
                              ? conversation.lastMessage.substring(0, 25) + '...'
                              : conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-500">
                              <span className="text-xs font-medium text-white">
                                {conversation.unreadCount}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2 lg:col-span-3 flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="px-6 py-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-100 text-primary-800">
                        {activeConversation.participant.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-base font-medium">
                        {activeConversation.participant.fullName}
                      </CardTitle>
                      <CardDescription>
                        {activeConversation.participant.company || 'Individual Buyer/Supplier'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>
                </div>
                {activeConversation.rfq && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500">Related to RFQ:</div>
                    <div className="text-sm font-medium">{activeConversation.rfq.title}</div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto px-6 py-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-primary-50 p-3 rounded-full">
                      <Send className="h-6 w-6 text-primary-500" />
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No Messages Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Send a message to start the conversation with {activeConversation.participant.fullName}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: any, index: number) => {
                      const isCurrentUser = message.senderId === user?.id;
                      const showDateSeparator = index === 0 || 
                        new Date(message.createdAt).toLocaleDateString() !== 
                        new Date(messages[index - 1].createdAt).toLocaleDateString();
                      
                      return (
                        <div key={message.id}>
                          {showDateSeparator && (
                            <div className="flex items-center my-4">
                              <Separator className="flex-1" />
                              <span className="px-3 text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                              <Separator className="flex-1" />
                            </div>
                          )}
                          
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                              {!isCurrentUser && (
                                <Avatar className="h-8 w-8 mb-1">
                                  <AvatarFallback className="bg-primary-100 text-primary-800">
                                    {activeConversation.participant.fullName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-primary-500 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                
                                {message.attachmentUrl && (
                                  <div className={`mt-2 p-2 rounded ${
                                    isCurrentUser ? 'bg-primary-400' : 'bg-gray-200'
                                  }`}>
                                    <a 
                                      href={message.attachmentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center text-xs hover:underline"
                                    >
                                      {getFileIcon(message.attachmentType)}
                                      <span className="ml-1 truncate">{message.attachmentName}</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                              
                              <p className={`text-xs text-gray-500 mt-1 ${
                                isCurrentUser ? 'text-right' : 'text-left'
                              }`}>
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              
              <div className="p-4 border-t flex-shrink-0">
                {attachment && (
                  <div className="bg-gray-100 rounded-md p-2 mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(attachment.type)}
                      <span className="ml-2 text-sm truncate">{attachment.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => setAttachment(null)}
                    >
                      &times;
                    </Button>
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      className="resize-none min-h-[80px]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button variant="outline" size="icon" type="button" className="cursor-pointer">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </label>
                    <Button onClick={handleSendMessage}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="bg-primary-50 p-4 rounded-full">
                <Send className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No Conversation Selected</h3>
              <p className="mt-2 text-base text-gray-500">
                Select a conversation from the list or start a new one from an RFQ or product page.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
