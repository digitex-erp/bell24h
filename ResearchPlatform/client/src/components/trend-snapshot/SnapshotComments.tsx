import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SnapshotComment } from "./types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Reply } from "lucide-react";

interface SnapshotCommentsProps {
  snapshotId: number;
}

export function SnapshotComments({ snapshotId }: SnapshotCommentsProps) {
  const [comments, setComments] = useState<SnapshotComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching comments
  const commentsQuery = useQuery({
    queryKey: [`/api/industry-trends/snapshot/${snapshotId}/comments`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/industry-trends/snapshot/${snapshotId}/comments`);
      return response.json();
    }
  });

  // Mutation for adding a comment
  const addCommentMutation = useMutation({
    mutationFn: async (data: {
      snapshotId: number;
      content: string;
      parentCommentId?: number;
    }) => {
      const response = await apiRequest("POST", "/api/industry-trends/snapshot/comment", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/industry-trends/snapshot/${snapshotId}/comments`]
      });
      setCommentText("");
      setReplyingTo(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Comment",
        description: error.message || "An error occurred while posting your comment.",
        variant: "destructive",
      });
    }
  });

  // Update comments when query data changes
  useEffect(() => {
    if (commentsQuery.data?.comments) {
      setComments(commentsQuery.data.comments);
    }
  }, [commentsQuery.data]);

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before posting.",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate({
      snapshotId,
      content: commentText.trim(),
      parentCommentId: replyingTo || undefined,
    });
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    // Focus on the textarea
    const textarea = document.getElementById("comment-textarea");
    if (textarea) {
      textarea.focus();
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Group comments by their parent-child relationships
  const organizeComments = () => {
    const topLevelComments: SnapshotComment[] = [];
    const childComments: Record<number, SnapshotComment[]> = {};
    
    // First, separate top-level comments and group child comments by parent ID
    comments.forEach((comment) => {
      if (comment.parentCommentId) {
        if (!childComments[comment.parentCommentId]) {
          childComments[comment.parentCommentId] = [];
        }
        childComments[comment.parentCommentId].push(comment);
      } else {
        topLevelComments.push(comment);
      }
    });
    
    return { topLevelComments, childComments };
  };

  const { topLevelComments, childComments } = organizeComments();

  const renderComment = (comment: SnapshotComment, isReply = false) => {
    const initials = comment.username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
    
    return (
      <div 
        key={comment.id} 
        className={`${isReply ? 'ml-8 mt-2' : 'mb-4'} border rounded-md p-3`}
      >
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">{comment.username}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </div>
            </div>
            <p className="text-sm">{comment.content}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 h-6 px-2 text-xs" 
              onClick={() => handleReply(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" /> Reply
            </Button>
          </div>
        </div>
        
        {/* Render child comments */}
        {childComments[comment.id]?.map(childComment => renderComment(childComment, true))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" /> 
          Comments {comments.length > 0 && `(${comments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commentsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topLevelComments.map(comment => renderComment(comment))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col border-t pt-3">
        {replyingTo && (
          <div className="w-full flex items-center justify-between bg-muted p-2 rounded-md mb-3">
            <span className="text-sm">
              Replying to comment
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelReply}
              className="h-6 px-2"
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="w-full flex gap-2">
          <Textarea
            id="comment-textarea"
            placeholder="Add your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="resize-none"
          />
          <Button
            className="shrink-0"
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !commentText.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {addCommentMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}