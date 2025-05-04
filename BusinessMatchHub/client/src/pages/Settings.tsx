import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { RootState } from '@/store/store';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    companyName: user?.companyName || '',
    email: user?.email || '',
    location: user?.location || '',
    industry: user?.industry || '',
    gstNumber: user?.gstNumber || '',
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    rfqUpdates: true,
    newMessages: true,
    marketInsights: false,
    priceAlerts: true,
    emailSummary: true,
    whatsappNotifications: false,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/user/password', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Password update failed',
        description: error.message || 'Please check your current password and try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Validate GST mutation
  const validateGstMutation = useMutation({
    mutationFn: async (gstNumber: string) => {
      const response = await apiRequest('POST', '/api/gst/validate', { gstNumber });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: 'GST Validated',
          description: 'Your GST number has been verified successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } else {
        toast({
          title: 'GST Validation Failed',
          description: 'The GST number provided is invalid.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'GST Validation Failed',
        description: error.message || 'Unable to validate GST number.',
        variant: 'destructive',
      });
    },
  });
  
  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/user/notifications', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Notification preferences updated',
        description: 'Your notification settings have been saved.',
      });
    },
  });
  
  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };
  
  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };
  
  // Handle profile submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };
  
  // Handle password submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };
  
  // Handle GST validation
  const handleValidateGST = () => {
    if (!profileForm.gstNumber) {
      toast({
        title: 'GST number required',
        description: 'Please enter a GST number to validate.',
        variant: 'destructive',
      });
      return;
    }
    
    validateGstMutation.mutate(profileForm.gstNumber);
  };
  
  // Handle notifications save
  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate(notifications);
  };
  
  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        
        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your account profile information and company details</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={profileForm.companyName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="City, State"
                        value={profileForm.location}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={profileForm.industry}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <div className="flex">
                        <Input
                          id="gstNumber"
                          name="gstNumber"
                          value={profileForm.gstNumber}
                          onChange={handleProfileChange}
                          className="flex-1"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          className="ml-2"
                          onClick={handleValidateGST}
                          disabled={validateGstMutation.isPending}
                        >
                          {validateGstMutation.isPending ? 'Validating...' : 'Validate GST'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {user?.gstVerified ? (
                          <span className="text-green-600">
                            <i className="fas fa-check-circle mr-1"></i> GST Verified
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            <i className="fas fa-info-circle mr-1"></i> GST verification required for full access
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Password Settings */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your account password</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
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
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
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
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Manage how you receive notifications</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">RFQ Updates</h3>
                      <p className="text-xs text-gray-500">
                        Get notified when your RFQs receive new quotes or status changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.rfqUpdates}
                      onCheckedChange={() => handleNotificationToggle('rfqUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">New Messages</h3>
                      <p className="text-xs text-gray-500">
                        Receive notifications when you get new messages from suppliers or buyers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newMessages}
                      onCheckedChange={() => handleNotificationToggle('newMessages')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Market Insights</h3>
                      <p className="text-xs text-gray-500">
                        Weekly updates on market trends and predictions for your industry
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketInsights}
                      onCheckedChange={() => handleNotificationToggle('marketInsights')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Price Alerts</h3>
                      <p className="text-xs text-gray-500">
                        Get alerts when prices change significantly for your frequently ordered items
                      </p>
                    </div>
                    <Switch
                      checked={notifications.priceAlerts}
                      onCheckedChange={() => handleNotificationToggle('priceAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Summary</h3>
                      <p className="text-xs text-gray-500">
                        Daily summary of all activity on your account
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailSummary}
                      onCheckedChange={() => handleNotificationToggle('emailSummary')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">WhatsApp Notifications</h3>
                      <p className="text-xs text-gray-500">
                        Receive time-sensitive notifications via WhatsApp
                      </p>
                    </div>
                    <Switch
                      checked={notifications.whatsappNotifications}
                      onCheckedChange={() => handleNotificationToggle('whatsappNotifications')}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Billing & Subscription</h2>
                <p className="text-sm text-gray-500">Manage your subscription and payment methods</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
                      <p className="text-lg font-semibold text-primary-800">Free Tier</p>
                    </div>
                    <Button variant="outline">Upgrade</Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <p><i className="fas fa-check text-green-500 mr-1"></i> 5 RFQs per month</p>
                    <p><i className="fas fa-check text-green-500 mr-1"></i> Basic AI matching</p>
                    <p><i className="fas fa-check text-green-500 mr-1"></i> Wallet access</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Available Plans</h3>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-sm cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Pro (Monthly)</h4>
                          <p className="text-sm text-gray-500">₹1,500/month</p>
                        </div>
                        <Button variant="outline" size="sm">Select</Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p><i className="fas fa-infinity mr-1"></i> Unlimited RFQs</p>
                        <p><i className="fas fa-chart-pie mr-1"></i> SHAP explanations</p>
                        <p><i className="fas fa-check-double mr-1"></i> GST compliance</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-sm cursor-pointer bg-gradient-to-r from-primary-50 to-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">Pro (Yearly)</h4>
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Save 20%</span>
                          </div>
                          <p className="text-sm text-gray-500">₹15,000/year</p>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p><i className="fas fa-infinity mr-1"></i> Unlimited RFQs</p>
                        <p><i className="fas fa-chart-pie mr-1"></i> SHAP explanations</p>
                        <p><i className="fas fa-check-double mr-1"></i> GST compliance</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-sm cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Enterprise</h4>
                          <p className="text-sm text-gray-500">₹50,000/month</p>
                        </div>
                        <Button variant="outline" size="sm">Contact Sales</Button>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p><i className="fas fa-cogs mr-1"></i> Custom AI models</p>
                        <p><i className="fas fa-code mr-1"></i> API access</p>
                        <p><i className="fas fa-lock mr-1"></i> Escrow integration</p>
                        <p><i className="fas fa-receipt mr-1"></i> Invoice discounting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
