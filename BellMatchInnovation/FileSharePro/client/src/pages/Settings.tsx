import { useState } from "react";
import { User } from "@shared/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  Lock, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface SettingsProps {
  user: User;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Settings({ user }: SettingsProps) {
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      company: user.company || "",
      avatar: user.avatar || "",
    },
  });
  
  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      setIsUpdatingProfile(true);
      
      await apiRequest("PUT", `/api/users/${user.id}`, values);
      
      // Invalidate cached user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const onUpdatePassword = async (values: z.infer<typeof securitySchema>) => {
    try {
      setIsUpdatingPassword(true);
      
      await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      
      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
          <p className="text-neutral-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1 py-2">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account settings
                </p>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("profile")}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "account" ? "default" : "ghost"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("account")}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Account & Security
                </Button>
                <Button 
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant={activeTab === "payment" ? "default" : "ghost"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("payment")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
                <Button 
                  variant={activeTab === "privacy" ? "default" : "ghost"}
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("privacy")}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Privacy & Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about yourself or your company" 
                              className="resize-none min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed on your public profile
                          </FormDescription>
                        </FormItem>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button 
                  onClick={profileForm.handleSubmit(onUpdateProfile)}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>Account & Security</CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="password" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="password" className="space-y-4 mt-4">
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {isUpdatingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="2fa" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Two-Factor Authentication</CardTitle>
                        <CardDescription>
                          Add an extra layer of security to your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-md font-medium">Enable Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground">
                              Protect your account with an additional authentication step
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="bg-muted p-4 rounded-md text-sm">
                          <p>Two-factor authentication is currently not enabled for your account.</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline">Learn More</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">RFQ Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when there are updates to your RFQs
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">New Quotes</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified when suppliers submit new quotes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Messages</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Payment Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment status changes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Marketing Emails</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional offers and newsletters
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-6 w-6 mr-4 text-primary" />
                          <div>
                            <p className="font-medium">VISA ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-6 w-6 mr-4 text-primary" />
                          <div>
                            <p className="font-medium">Mastercard ending in 5678</p>
                            <p className="text-sm text-muted-foreground">Expires 08/2024</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Remove</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>
                  Manage your data privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Control who can view your profile information
                      </p>
                    </div>
                    <select className="border p-2 rounded">
                      <option>Everyone</option>
                      <option>Verified Partners Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Data Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow us to use your data for improving our services
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium">Personalized Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive personalized supplier and RFQ recommendations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      Download My Data
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive">Delete Account</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
