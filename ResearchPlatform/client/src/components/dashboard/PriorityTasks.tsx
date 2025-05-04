import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CodeSquare, 
  Database, 
  FileText, 
  Globe, 
  Headphones, 
  MessageCircle, 
  User 
} from "lucide-react";
import { updateTaskStatus, getTaskDetails } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type TaskStatus = 'Pending' | 'In Progress' | 'At Risk' | 'Completed';

type TaskAssignee = {
  id: number;
  name: string;
  role: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  completion: number;
  status: string;
  assignedTo: TaskAssignee;
};

type TasksData = {
  tasks: Task[];
};

type TaskNote = {
  id: number;
  text: string;
  author: string;
  timestamp: string;
};

type TaskDetails = Task & {
  created: string;
  updated: string;
  notes: TaskNote[];
};

type PriorityTasksProps = {
  data: TasksData;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Voice/Video RFQ':
      return <Headphones className="h-5 w-5 text-primary-600" />;
    case 'Payment System':
      return <Building2 className="h-5 w-5 text-secondary-600" />;
    case 'Analytics Dashboard':
      return <Database className="h-5 w-5 text-accent-600" />;
    case 'Core Platform':
      return <CodeSquare className="h-5 w-5 text-indigo-600" />;
    case 'Global Trade Insights':
      return <Globe className="h-5 w-5 text-emerald-600" />;
    default:
      return <FileText className="h-5 w-5 text-neutral-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return "bg-green-500";
    case 'In Progress':
      return "bg-yellow-500";
    case 'At Risk':
      return "bg-red-500";
    case 'Pending':
      return "bg-blue-500";
    default:
      return "bg-neutral-500";
  }
};

export default function PriorityTasks({ data }: PriorityTasksProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch task details when a task is selected
  const taskDetailsQuery = useQuery({
    queryKey: ['/api/dashboard/task', selectedTaskId],
    queryFn: () => selectedTaskId ? getTaskDetails(selectedTaskId) : null,
    enabled: selectedTaskId !== null,
  });

  // Mutation for updating task status
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status, completion }: { taskId: number, status?: string, completion?: number }) => 
      updateTaskStatus(taskId, status, completion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/priority-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/task', selectedTaskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/completion'] });
      
      toast({
        title: "Task updated",
        description: "The task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update task",
        description: "There was an error updating the task status.",
        variant: "destructive",
      });
    },
  });

  const handleViewTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const handleUpdateCompletion = (taskId: number, newCompletion: number) => {
    updateTaskMutation.mutate({ taskId, completion: newCompletion });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">High Priority Tasks</h2>
        <Button>Assign Resources</Button>
      </div>
      
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary/10 text-primary rounded-md">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{task.title}</div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {task.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${task.completion}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">{task.completion}% Complete</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(task.status)}`}></span>
                      <span className="text-sm text-foreground">{task.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">{task.assignedTo.name}</div>
                        <div className="text-xs text-muted-foreground">{task.assignedTo.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary/80 mr-3"
                      onClick={() => handleViewTask(task.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleViewTask(task.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {taskDetailsQuery.isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : taskDetailsQuery.isError ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Error loading task details. Please try again.</p>
            </div>
          ) : taskDetailsQuery.data ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{taskDetailsQuery.data.title}</DialogTitle>
                <DialogDescription className="flex items-center mt-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mr-2">
                    {taskDetailsQuery.data.category}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Created: {formatDate(taskDetailsQuery.data.created)} • 
                    Last updated: {formatDate(taskDetailsQuery.data.updated)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{taskDetailsQuery.data.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <div className="flex space-x-2">
                    {(['Pending', 'In Progress', 'At Risk', 'Completed'] as TaskStatus[]).map((status) => (
                      <Button
                        key={status}
                        variant={taskDetailsQuery.data.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(taskDetailsQuery.data.id, status)}
                        disabled={updateTaskMutation.isPending}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Completion ({taskDetailsQuery.data.completion}%)</h3>
                  <Progress value={taskDetailsQuery.data.completion} className="h-2" />
                  <div className="flex justify-between mt-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateCompletion(taskDetailsQuery.data.id, value)}
                        disabled={updateTaskMutation.isPending || taskDetailsQuery.data.completion === value}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Assigned To</h3>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{taskDetailsQuery.data.assignedTo.name}</div>
                      <div className="text-xs text-muted-foreground">{taskDetailsQuery.data.assignedTo.role}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Activity & Notes</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                    {taskDetailsQuery.data.notes.map((note) => (
                      <div key={note.id} className="border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{note.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                <Button className="flex items-center">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
