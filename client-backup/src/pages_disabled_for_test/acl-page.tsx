import React, { useState } from 'react';
import { useACLs, useACL, AclRule, AclAssignment } from '@/hooks/use-acl';
import { useOrganizations } from '@/hooks/use-organizations';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Users, User, UserPlus, Trash2, PenSquare, Building, Shield, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import PermissionCheck from '@/components/acl/permission-check';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  organization_id: z.number({
    required_error: "Please select an organization.",
  }).nullable(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function ACLPage() {
  const { user } = useAuth();
  const { acls, isLoading, createAcl, isCreating } = useACLs();
  const { organizations } = useOrganizations();
  const [selectedAcl, setSelectedAcl] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      organization_id: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createAcl({
        name: data.name,
        description: data.description || '',
        organization_id: data.organization_id || undefined,
      });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ACL",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Access Control Lists</h1>
          <p className="text-muted-foreground mt-1">
            Manage permissions for resources across the platform
          </p>
        </div>
        <PermissionCheck resourceType="acl" requiredPermission="create">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create ACL</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Access Control List</DialogTitle>
                <DialogDescription>
                  Define a new set of permissions that can be assigned to users, teams, or organizations.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Admin Access, Read-only Access" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for this access control list.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Full access to billing resources" {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of what this ACL is for.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : null)}
                          value={field.value?.toString() || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an organization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None (Global ACL)</SelectItem>
                            {organizations?.map((org) => (
                              <SelectItem key={org.id} value={org.id.toString()}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Optionally limit this ACL to a specific organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create ACL'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </PermissionCheck>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Lists</CardTitle>
              <CardDescription>
                Select an ACL to view and manage its permissions and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {acls?.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No access control lists found
                  </div>
                ) : (
                  acls?.map((acl) => (
                    <div
                      key={acl.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center hover:bg-accent ${selectedAcl === acl.id ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedAcl(acl.id)}
                    >
                      <div>
                        <p className="font-medium">{acl.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {acl.description || 'No description'}
                        </p>
                      </div>
                      {acl.organization_id && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>Org</span>
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2">
          {selectedAcl ? (
            <ACLDetail aclId={selectedAcl} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No ACL Selected</p>
                <p className="text-muted-foreground mt-1">
                  Select an access control list from the sidebar to view and manage its details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface ACLDetailProps {
  aclId: number;
}

function ACLDetail({ aclId }: ACLDetailProps) {
  const {
    acl, rules, assignments,
    isLoading, isLoadingRules, isLoadingAssignments,
    addRule, updateRule, deleteRule,
    addAssignment, deleteAssignment
  } = useACL(aclId);
  const { organizations } = useOrganizations();
  const [activeTab, setActiveTab] = useState('rules');
  const [isAddRuleDialogOpen, setIsAddRuleDialogOpen] = useState(false);
  const [isAddAssignmentDialogOpen, setIsAddAssignmentDialogOpen] = useState(false);

  const resourceTypeSchema = z.object({
    resource_type: z.string().min(1, 'Resource type is required'),
    permission: z.enum(['full', 'create', 'read', 'update', 'delete', 'none'], {
      required_error: 'Permission level is required',
    }),
  });

  const assignmentSchema = z.object({
    user_id: z.string().optional(),
    team_id: z.string().optional(),
    organization_id: z.string().optional(),
  }).refine(data => data.user_id || data.team_id || data.organization_id, {
    message: 'You must select at least one of: user, team, or organization',
    path: ['user_id'],
  });

  const ruleForm = useForm<z.infer<typeof resourceTypeSchema>>({
    resolver: zodResolver(resourceTypeSchema),
    defaultValues: {
      resource_type: '',
      permission: 'read',
    }
  });

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      user_id: '',
      team_id: '',
      organization_id: '',
    }
  });

  const onAddRule = async (data: z.infer<typeof resourceTypeSchema>) => {
    try {
      await addRule(data);
      setIsAddRuleDialogOpen(false);
      ruleForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add rule",
        variant: "destructive",
      });
    }
  };

  const onAddAssignment = async (data: z.infer<typeof assignmentSchema>) => {
    try {
      await addAssignment({
        user_id: data.user_id ? parseInt(data.user_id, 10) : undefined,
        team_id: data.team_id ? parseInt(data.team_id, 10) : undefined,
        organization_id: data.organization_id ? parseInt(data.organization_id, 10) : undefined,
      });
      setIsAddAssignmentDialogOpen(false);
      assignmentForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add assignment",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {acl?.name}
            </CardTitle>
            <CardDescription>{acl?.description || 'No description'}</CardDescription>
          </div>
          {acl?.organization_id && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Building className="h-3 w-3" />
              <span>
                {organizations?.find(org => org.id === acl.organization_id)?.name || 'Organization'}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Permission Rules</h3>
              <PermissionCheck resourceType="acl" resourceId={aclId} requiredPermission="update">
                <Dialog open={isAddRuleDialogOpen} onOpenChange={setIsAddRuleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Rule</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Permission Rule</DialogTitle>
                      <DialogDescription>
                        Define what resources this ACL can access and with what permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...ruleForm}>
                      <form onSubmit={ruleForm.handleSubmit(onAddRule)} className="space-y-4">
                        <FormField
                          control={ruleForm.control}
                          name="resource_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resource Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., rfq, bid, organization" {...field} />
                              </FormControl>
                              <FormDescription>
                                The type of resource this rule applies to.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="permission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permission Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select permission level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="full">Full Access</SelectItem>
                                  <SelectItem value="create">Create</SelectItem>
                                  <SelectItem value="read">Read</SelectItem>
                                  <SelectItem value="update">Update</SelectItem>
                                  <SelectItem value="delete">Delete</SelectItem>
                                  <SelectItem value="none">No Access</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The level of access granted for this resource type.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Add Rule</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </PermissionCheck>
            </div>
            
            {isLoadingRules ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : rules?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rules defined for this ACL</p>
                <p className="text-sm mt-1">Add rules to define what resources can be accessed</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules?.map((rule: AclRule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.resource_type}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getBadgeVariantForPermission(rule.permission)}
                          className="capitalize"
                        >
                          {rule.permission}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <PermissionCheck resourceType="acl" resourceId={aclId} requiredPermission="update">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionCheck>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="assignments">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">ACL Assignments</h3>
              <PermissionCheck resourceType="acl" resourceId={aclId} requiredPermission="update">
                <Dialog open={isAddAssignmentDialogOpen} onOpenChange={setIsAddAssignmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Add Assignment</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign ACL</DialogTitle>
                      <DialogDescription>
                        Assign this ACL to a user, team, or organization.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...assignmentForm}>
                      <form onSubmit={assignmentForm.handleSubmit(onAddAssignment)} className="space-y-4">
                        <FormField
                          control={assignmentForm.control}
                          name="user_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="User ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                Assign to a specific user by ID.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={assignmentForm.control}
                          name="team_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Team ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                Assign to a specific team by ID.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={assignmentForm.control}
                          name="organization_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization (Optional)</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select organization" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  {organizations?.map((org) => (
                                    <SelectItem key={org.id} value={org.id.toString()}>
                                      {org.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Assign to a specific organization.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Add Assignment</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </PermissionCheck>
            </div>
            
            {isLoadingAssignments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : assignments?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>This ACL has not been assigned to anyone</p>
                <p className="text-sm mt-1">Assign this ACL to users, teams, or organizations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments?.map((assignment: AclAssignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {getAssignmentType(assignment)}
                      </TableCell>
                      <TableCell>{getAssignmentTarget(assignment)}</TableCell>
                      <TableCell className="text-right">
                        <PermissionCheck resourceType="acl" resourceId={aclId} requiredPermission="update">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionCheck>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getBadgeVariantForPermission(permission: string) {
  switch (permission) {
    case 'full':
      return 'default';
    case 'create':
      return 'success';
    case 'read':
      return 'secondary';
    case 'update':
      return 'warning';
    case 'delete':
      return 'destructive';
    case 'none':
      return 'outline';
    default:
      return 'outline';
  }
}

function getAssignmentType(assignment: AclAssignment) {
  if (assignment.user_id) {
    return <div className="flex items-center gap-1.5"><User className="h-4 w-4" /> User</div>;
  } else if (assignment.team_id) {
    return <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Team</div>;
  } else if (assignment.organization_id) {
    return <div className="flex items-center gap-1.5"><Building className="h-4 w-4" /> Organization</div>;
  }
  return 'Unknown';
}

function getAssignmentTarget(assignment: AclAssignment) {
  if (assignment.user_id) {
    return `User ID: ${assignment.user_id}`;
  } else if (assignment.team_id) {
    return `Team ID: ${assignment.team_id}`;
  } else if (assignment.organization_id) {
    return `Organization ID: ${assignment.organization_id}`;
  }
  return 'Unknown';
}