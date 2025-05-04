import { Express, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

// Initialize the Dashboard service
const dashboardService = new DashboardService();

export function registerDashboardRoutes(app: Express) {
  // Get project completion status
  app.get('/api/dashboard/completion', async (req: Request, res: Response) => {
    try {
      const completionData = await dashboardService.getProjectCompletion();
      return res.status(200).json(completionData);
    } catch (error) {
      console.error('Error fetching project completion data:', error);
      return res.status(500).json({ message: 'Failed to fetch project completion data' });
    }
  });

  // Get priority tasks
  app.get('/api/dashboard/priority-tasks', async (req: Request, res: Response) => {
    try {
      const priorityTasks = await dashboardService.getPriorityTasks();
      return res.status(200).json(priorityTasks);
    } catch (error) {
      console.error('Error fetching priority tasks:', error);
      return res.status(500).json({ message: 'Failed to fetch priority tasks' });
    }
  });

  // Get integration status
  app.get('/api/dashboard/integration-status', async (req: Request, res: Response) => {
    try {
      const integrationStatus = await dashboardService.getIntegrationStatus();
      return res.status(200).json(integrationStatus);
    } catch (error) {
      console.error('Error fetching integration status:', error);
      return res.status(500).json({ message: 'Failed to fetch integration status' });
    }
  });

  // Get system health
  app.get('/api/dashboard/system-health', async (req: Request, res: Response) => {
    try {
      const systemHealth = await dashboardService.getSystemHealth();
      return res.status(200).json(systemHealth);
    } catch (error) {
      console.error('Error fetching system health:', error);
      return res.status(500).json({ message: 'Failed to fetch system health' });
    }
  });

  // Get detailed task info
  app.get('/api/dashboard/task/:taskId', async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Valid task ID is required' });
      }
      
      const taskDetails = await dashboardService.getTaskDetails(taskId);
      
      if (!taskDetails) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.status(200).json(taskDetails);
    } catch (error) {
      console.error('Error fetching task details:', error);
      return res.status(500).json({ message: 'Failed to fetch task details' });
    }
  });

  // Update task status
  app.put('/api/dashboard/task/:taskId', async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: 'Valid task ID is required' });
      }
      
      const { status, completion } = req.body;
      
      if (status === undefined && completion === undefined) {
        return res.status(400).json({ message: 'Either status or completion must be provided' });
      }
      
      const updatedTask = await dashboardService.updateTaskStatus(taskId, status, completion);
      
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
      return res.status(500).json({ message: 'Failed to update task status' });
    }
  });
}
