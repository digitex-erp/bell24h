import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle,
  Save,
  UserCircle
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Profile settings form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    company: user?.company || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    country: user?.country || "India",
    gstNumber: user?.gstNumber || "",
  });
  
  // Notification settings
  const { data: notificationSettings, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["/api/settings/notifications"],
  });
  
  // Security settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/settings/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/settings/password", data);
      return response.json();
    },
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Password Update Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating notification settings
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/settings/notifications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/notifications"] });
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };
  
  const handleNotificationToggle = (type: string, channel: string, value: boolean) => {
    updateNotificationsMutation.mutate({
      type,
      [channel]: value,
    });
  };
  
  return (
    <div className="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 space-y-1">
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
              <TabsTrigger 
                value="profile" 
                className="justify-start px-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start px-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="justify-start px-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="justify-start px-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal and business information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid gap-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          <UserCircle className="h-12 w-12" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Profile Picture</h4>
                          <p className="text-sm text-gray-500">Upload a profile picture for your account.</p>
                          <div className="flex gap-2 mt-2">
                            <Button type="button" variant="outline" size="sm">
                              Upload
                            </Button>
                            <Button type="button" variant="ghost" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-3">
                        <h3 className="text-lg font-medium">Personal Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={profileForm.fullName}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profileForm.email}
                              onChange={handleProfileChange}
                              disabled
                            />
                            <p className="text-xs text-gray-500">
                              Email cannot be changed. Contact support for assistance.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={profileForm.phone}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              name="company"
                              value={profileForm.company}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                              id="gstNumber"
                              name="gstNumber"
                              value={profileForm.gstNumber}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-3">
                        <h3 className="text-lg font-medium">Address Information</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            name="address"
                            value={profileForm.address}
                            onChange={handleProfileChange}
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={profileForm.city}
                              onChange={handleProfileChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Select 
                              value={profileForm.state}
                              onValueChange={(value) => 
                                setProfileForm((prev) => ({ ...prev, state: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                <SelectItem value="Delhi">Delhi</SelectItem>
                                <SelectItem value="Karnataka">Karnataka</SelectItem>
                                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                <SelectItem value="Gujarat">Gujarat</SelectItem>
                                <SelectItem value="Telangana">Telangana</SelectItem>
                                <SelectItem value="West Bengal">West Bengal</SelectItem>
                                <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                                <SelectItem value="Kerala">Kerala</SelectItem>
                                {/* Add more states as needed */}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select 
                              value={profileForm.country}
                              onValueChange={(value) => 
                                setProfileForm((prev) => ({ ...prev, country: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                                {/* Add more countries as needed */}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="inline-flex items-center"
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications from Bell24h.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingNotifications ? (
                    <div className="flex justify-center py-6">
                      <p className="text-sm text-gray-500">Loading notification settings...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">RFQ Notifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">New RFQ Matches</p>
                            <p className="text-sm text-gray-500">Receive notifications when new RFQs match your profile.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="rfq-email" 
                                checked={notificationSettings?.rfq?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("rfq", "email", checked)
                                }
                              />
                              <Label htmlFor="rfq-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="rfq-inApp" 
                                checked={notificationSettings?.rfq?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("rfq", "inApp", checked)
                                }
                              />
                              <Label htmlFor="rfq-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">RFQ Status Updates</p>
                            <p className="text-sm text-gray-500">Receive notifications when an RFQ status changes.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="rfq-status-email" 
                                checked={notificationSettings?.rfq_status?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("rfq_status", "email", checked)
                                }
                              />
                              <Label htmlFor="rfq-status-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="rfq-status-inApp" 
                                checked={notificationSettings?.rfq_status?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("rfq_status", "inApp", checked)
                                }
                              />
                              <Label htmlFor="rfq-status-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Bid Notifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">New Bids</p>
                            <p className="text-sm text-gray-500">Receive notifications when you receive a new bid.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="bid-email" 
                                checked={notificationSettings?.bid?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("bid", "email", checked)
                                }
                              />
                              <Label htmlFor="bid-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="bid-inApp" 
                                checked={notificationSettings?.bid?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("bid", "inApp", checked)
                                }
                              />
                              <Label htmlFor="bid-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">Bid Status Updates</p>
                            <p className="text-sm text-gray-500">Receive notifications when a bid status changes.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="bid-status-email" 
                                checked={notificationSettings?.bid_status?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("bid_status", "email", checked)
                                }
                              />
                              <Label htmlFor="bid-status-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="bid-status-inApp" 
                                checked={notificationSettings?.bid_status?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("bid_status", "inApp", checked)
                                }
                              />
                              <Label htmlFor="bid-status-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Other Notifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">Messages</p>
                            <p className="text-sm text-gray-500">Receive notifications for new messages.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="message-email" 
                                checked={notificationSettings?.message?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("message", "email", checked)
                                }
                              />
                              <Label htmlFor="message-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="message-inApp" 
                                checked={notificationSettings?.message?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("message", "inApp", checked)
                                }
                              />
                              <Label htmlFor="message-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">Wallet Updates</p>
                            <p className="text-sm text-gray-500">Receive notifications for wallet transactions.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="wallet-email" 
                                checked={notificationSettings?.wallet?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("wallet", "email", checked)
                                }
                              />
                              <Label htmlFor="wallet-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="wallet-inApp" 
                                checked={notificationSettings?.wallet?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("wallet", "inApp", checked)
                                }
                              />
                              <Label htmlFor="wallet-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-200 pb-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">Logistics Updates</p>
                            <p className="text-sm text-gray-500">Receive notifications for shipment tracking updates.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="logistics-email" 
                                checked={notificationSettings?.logistics?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("logistics", "email", checked)
                                }
                              />
                              <Label htmlFor="logistics-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="logistics-inApp" 
                                checked={notificationSettings?.logistics?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("logistics", "inApp", checked)
                                }
                              />
                              <Label htmlFor="logistics-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4">
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium">System Updates</p>
                            <p className="text-sm text-gray-500">Receive notifications about system updates and maintenance.</p>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="system-email" 
                                checked={notificationSettings?.system?.email || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("system", "email", checked)
                                }
                              />
                              <Label htmlFor="system-email" className="text-sm">Email</Label>
                            </div>
                          </div>
                          <div className="flex items-center justify-start md:justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="system-inApp" 
                                checked={notificationSettings?.system?.inApp || false}
                                onCheckedChange={(checked) => 
                                  handleNotificationToggle("system", "inApp", checked)
                                }
                              />
                              <Label htmlFor="system-inApp" className="text-sm">In-App</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                        <p className="text-xs text-gray-500">
                          Password must be at least 8 characters long.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updatePasswordMutation.isPending}
                        >
                          {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium mb-4">Session Management</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">
                              Chrome on Windows • IP: 103.78.xx.xx • Last active: Just now
                            </p>
                          </div>
                          <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded-full">
                            Current
                          </span>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button variant="destructive">Sign Out All Other Devices</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Settings</CardTitle>
                  <CardDescription>
                    Manage your billing information and payment methods.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      
                      <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-base font-medium text-primary-700">Free Plan</p>
                            <p className="text-sm text-primary-600">Standard features for individuals and small businesses.</p>
                          </div>
                          <Button variant="outline">Upgrade</Button>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-md text-center">
                            <p className="text-sm text-gray-500">RFQs per month</p>
                            <p className="text-lg font-bold">10</p>
                          </div>
                          <div className="bg-white p-3 rounded-md text-center">
                            <p className="text-sm text-gray-500">Products</p>
                            <p className="text-lg font-bold">25</p>
                          </div>
                          <div className="bg-white p-3 rounded-md text-center">
                            <p className="text-sm text-gray-500">Storage</p>
                            <p className="text-lg font-bold">100 MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium">Payment Methods</h3>
                      
                      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium">Add a payment method</p>
                            <p className="text-sm text-gray-500">Add a credit card to enable premium features.</p>
                          </div>
                        </div>
                        <Button>Add Method</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium">Billing History</h3>
                      
                      <div className="text-center py-6">
                        <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900">No Billing History</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                          You haven't made any payments yet. Your billing history will appear here once you upgrade to a paid plan.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
