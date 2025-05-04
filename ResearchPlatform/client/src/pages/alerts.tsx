import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bell, Check, Plus, Settings, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Alert form schema
const alertFormSchema = z.object({
  name: z.string().min(3, { message: 'Alert name is required and must be at least 3 characters' }),
  description: z.string().optional(),
  alertType: z.enum(['price', 'rfq', 'market-change', 'compliance', 'supplier', 'other']),
  conditions: z.any(), // For simplicity, we're using any for the JSON objects
  actions: z.any(),
  frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']),
  enabled: z.boolean().default(true)
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

// Preference form schema
const preferenceFormSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  inAppEnabled: z.boolean().default(true),
  doNotDisturbEnabled: z.boolean().default(false),
  doNotDisturbStart: z.string().optional(),
  doNotDisturbEnd: z.string().optional()
});

type PreferenceFormValues = z.infer<typeof preferenceFormSchema>;

export default function AlertsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('alerts');
  const { toast } = useToast();

  // Fetch alert configurations
  const { data: alertConfigurations = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['/api/alerts'],
    enabled: activeTab === 'alerts'
  });

  // Fetch user notifications
  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: activeTab === 'notifications'
  });

  // Fetch alert preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['/api/alert-preferences'],
    enabled: activeTab === 'preferences'
  });

  // Mutations
  const createAlertMutation = useMutation({
    mutationFn: (data: AlertFormValues) => apiRequest('POST', '/api/alerts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Alert Created",
        description: "Your alert configuration has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Alert",
        description: error.message || "There was an error creating your alert configuration.",
        variant: "destructive",
      });
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest('PATCH', `/api/alerts/${alertId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert Updated",
        description: "Alert enabled status has been updated.",
      });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest('DELETE', `/api/alerts/${alertId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Alert Deleted",
        description: "Your alert configuration has been deleted.",
      });
    }
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => apiRequest('PATCH', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Notifications Marked as Read",
        description: "All notifications have been marked as read.",
      });
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: PreferenceFormValues) => apiRequest('PUT', '/api/alert-preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alert-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your alert preferences have been updated.",
      });
    }
  });

  // Alert form
  const alertForm = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: '',
      description: '',
      alertType: 'price',
      conditions: { threshold: 0, comparison: '>' },
      actions: { notify: true, email: false, sms: false },
      frequency: 'realtime',
      enabled: true
    }
  });

  // Preferences form
  const preferencesForm = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceFormSchema),
    defaultValues: preferences || {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      doNotDisturbEnabled: false
    }
  });

  // Update preferences form when data loads
  React.useEffect(() => {
    if (preferences) {
      preferencesForm.reset(preferences);
    }
  }, [preferences, preferencesForm]);

  // Handle alert form submission
  function onAlertSubmit(data: AlertFormValues) {
    createAlertMutation.mutate(data);
  }

  // Handle preferences form submission
  function onPreferencesSubmit(data: PreferenceFormValues) {
    updatePreferencesMutation.mutate(data);
  }

  // Handle delete confirmation
  function handleDeleteClick(alertId: number) {
    setSelectedAlertId(alertId);
    setIsDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (selectedAlertId) {
      deleteAlertMutation.mutate(selectedAlertId);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Alert System</h1>
          <p className="text-muted-foreground">Manage your alerts and notifications</p>
        </div>
        {activeTab === 'alerts' && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Create Alert
          </Button>
        )}
        {activeTab === 'notifications' && notifications?.length > 0 && (
          <Button 
            onClick={() => markAllNotificationsAsReadMutation.mutate()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Check size={16} /> Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alert Configurations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Alert Configurations Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Your Alert Configurations</CardTitle>
              <CardDescription>
                Create and manage alert configurations to stay updated on important events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : alertConfigurations?.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertConfigurations.map((alert: any) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-medium">
                            {alert.name}
                            {alert.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {alert.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {alert.alertType}
                            </Badge>
                          </TableCell>
                          <TableCell>{alert.frequency}</TableCell>
                          <TableCell>
                            <Badge variant={alert.enabled ? "default" : "outline"}>
                              {alert.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAlertMutation.mutate(alert.id)}
                                title={alert.enabled ? "Disable alert" : "Enable alert"}
                              >
                                {alert.enabled ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(alert.id)}
                                title="Delete alert"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Alert Configurations</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any alert configurations yet.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create Your First Alert
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Your Notifications</CardTitle>
              <CardDescription>
                View and manage your notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingNotifications ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : notifications?.length ? (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${!notification.readAt ? 'bg-accent/10' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${notification.type === 'critical' ? 'bg-destructive/10 text-destructive' : notification.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!notification.readAt && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markNotificationAsReadMutation.mutate(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Notifications</h3>
                  <p className="text-muted-foreground">
                    You don't have any unread notifications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Alert Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPreferences ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={preferencesForm.control}
                          name="inAppEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel>In-App Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications within the platform
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={preferencesForm.control}
                          name="emailEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Send notifications to your email address
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={preferencesForm.control}
                          name="pushEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel>Push Notifications</FormLabel>
                                <FormDescription>
                                  Receive push notifications in your browser
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={preferencesForm.control}
                          name="smsEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div>
                                <FormLabel>SMS Notifications</FormLabel>
                                <FormDescription>
                                  Get alerts via text message (additional charges may apply)
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Do Not Disturb</h3>
                      <FormField
                        control={preferencesForm.control}
                        name="doNotDisturbEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg mb-4">
                            <div>
                              <FormLabel>Enable Quiet Hours</FormLabel>
                              <FormDescription>
                                Automatically pause notifications during specified hours
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {preferencesForm.watch('doNotDisturbEnabled') && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={preferencesForm.control}
                            name="doNotDisturbStart"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    value={field.value || '22:00'}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={preferencesForm.control}
                            name="doNotDisturbEnd"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field} 
                                    value={field.value || '07:00'}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Save Preferences
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Alert Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogDescription>
              Set up an alert to get notified when important events occur.
            </DialogDescription>
          </DialogHeader>

          <Form {...alertForm}>
            <form onSubmit={alertForm.handleSubmit(onAlertSubmit)} className="space-y-4">
              <FormField
                control={alertForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Price Drop Alert" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={alertForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add more details about this alert..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={alertForm.control}
                  name="alertType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="price">Price Change</SelectItem>
                          <SelectItem value="rfq">RFQ Updates</SelectItem>
                          <SelectItem value="market-change">Market Change</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="supplier">Supplier Activity</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={alertForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={alertForm.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Activate this alert immediately after creation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAlertMutation.isPending}>
                  {createAlertMutation.isPending ? 
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div> : 
                    null
                  }
                  Create Alert
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteAlertMutation.isPending}
            >
              {deleteAlertMutation.isPending ? 
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div> : 
                null
              }
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}