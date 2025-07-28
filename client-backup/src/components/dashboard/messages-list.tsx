
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface MessagesListProps {
  messages: {
    id: number;
    sender: {
      id: number;
      username: string;
      company_name?: string;
    };
    content: string;
    created_at: string;
  }[];
  title?: string;
  onViewAll?: () => void;
}

export function MessagesList({ messages, title = "Recent Messages", onViewAll }: MessagesListProps) {
  // Function to format the creation date relative to now
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Function to get first letter of username for avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Function to truncate message content
  const truncateContent = (content: string, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          {onViewAll && (
            <Button 
              variant="link" 
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
              onClick={onViewAll}
            >
              View all
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li key={message.id} className="py-4 px-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {getInitial(message.sender.username)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {message.sender.username}
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {truncateContent(message.content)}
                    </p>
                  </div>
                  <div>
                    <Link href={`/messages?user=${message.sender.id}`}>
                      <a className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                        Reply
                      </a>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            
            {messages.length === 0 && (
              <li className="py-4 px-6 text-center text-sm text-gray-500">
                No messages found
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      
      {onViewAll && (
        <CardFooter className="p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewAll}
          >
            View all messages
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
