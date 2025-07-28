import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Edit,
  Delete,
  Refresh,
  Add,
  Timeline,
  Error,
  CheckCircle
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { n8nService } from '../../services/n8n';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  triggerCount: number;
  updatedAt: string;
}

interface WorkflowExecution {
  id: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

interface WorkflowStats {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  executionsByDay: Array<{
    date: string;
    count: number;
    success: number;
    error: number;
  }>;
}

export const N8nDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Fetch workflows
  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await n8nService.getWorkflows();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workflows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workflow executions
  const fetchExecutions = async (workflowId: string) => {
    try {
      const data = await n8nService.getWorkflowExecutions(workflowId);
      setExecutions(data);
    } catch (err) {
      setError('Failed to fetch executions');
      console.error(err);
    }
  };

  // Fetch workflow stats
  const fetchStats = async (workflowId: string) => {
    try {
      const [startDate, endDate] = dateRange;
      const data = await n8nService.getWorkflowStats(
        workflowId,
        startDate || undefined,
        endDate || undefined
      );
      setStats(data);
    } catch (err) {
      setError('Failed to fetch stats');
      console.error(err);
    }
  };

  // Handle workflow selection
  const handleWorkflowSelect = async (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    await Promise.all([
      fetchExecutions(workflow.id),
      fetchStats(workflow.id)
    ]);
  };

  // Handle workflow activation/deactivation
  const handleWorkflowToggle = async (workflow: Workflow) => {
    try {
      await n8nService.updateWorkflow(workflow.id, {
        ...workflow,
        active: !workflow.active
      });
      await fetchWorkflows();
    } catch (err) {
      setError('Failed to update workflow');
      console.error(err);
    }
  };

  // Handle workflow deletion
  const handleWorkflowDelete = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await n8nService.deleteWorkflow(workflowId);
        await fetchWorkflows();
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
          setExecutions([]);
          setStats(null);
        }
      } catch (err) {
        setError('Failed to delete workflow');
        console.error(err);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Refresh data when date range changes
  useEffect(() => {
    if (selectedWorkflow) {
      fetchStats(selectedWorkflow.id);
    }
  }, [dateRange]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        n8n Workflow Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Workflows List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Workflows</Typography>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  New Workflow
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workflows.map((workflow) => (
                      <TableRow
                        key={workflow.id}
                        selected={selectedWorkflow?.id === workflow.id}
                        onClick={() => handleWorkflowSelect(workflow)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{workflow.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={workflow.active ? 'Active' : 'Inactive'}
                            color={workflow.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWorkflowToggle(workflow);
                            }}
                          >
                            {workflow.active ? <Stop /> : <PlayArrow />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWorkflow(workflow);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWorkflowDelete(workflow.id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Workflow Details */}
        <Grid item xs={12} md={8}>
          {selectedWorkflow ? (
            <>
              {/* Stats Overview */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedWorkflow.name} - Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={dateRange[0]}
                      onChange={(date) => setDateRange([date, dateRange[1]])}
                    />
                    <DatePicker
                      label="End Date"
                      value={dateRange[1]}
                      onChange={(date) => setDateRange([dateRange[0], date])}
                    />
                  </Box>
                  {stats && (
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Total Executions</Typography>
                        <Typography variant="h4">{stats.totalExecutions}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Success Rate</Typography>
                        <Typography variant="h4">{stats.successRate}%</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Avg Duration</Typography>
                        <Typography variant="h4">{stats.averageDuration}ms</Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {/* Execution Chart */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Execution History
                  </Typography>
                  {stats && (
                    <LineChart
                      width={800}
                      height={300}
                      data={stats.executionsByDay}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="success" stroke="#4caf50" />
                      <Line type="monotone" dataKey="error" stroke="#f44336" />
                    </LineChart>
                  )}
                </CardContent>
              </Card>

              {/* Recent Executions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Executions
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {executions.map((execution) => (
                          <TableRow key={execution.id}>
                            <TableCell>
                              {new Date(execution.startedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={
                                  execution.status === 'success' ? (
                                    <CheckCircle />
                                  ) : (
                                    <Error />
                                  )
                                }
                                label={execution.status}
                                color={execution.status === 'success' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {execution.finishedAt
                                ? `${new Date(execution.finishedAt).getTime() -
                                    new Date(execution.startedAt).getTime()}ms`
                                : '-'}
                            </TableCell>
                            <TableCell>{execution.error || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="body1" color="textSecondary" align="center">
                  Select a workflow to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Trigger Type</InputLabel>
            <Select label="Trigger Type">
              <MenuItem value="webhook">Webhook</MenuItem>
              <MenuItem value="schedule">Schedule</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="outlined"
            defaultValue={selectedWorkflow?.name}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              defaultValue={selectedWorkflow?.active ? 'active' : 'inactive'}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 