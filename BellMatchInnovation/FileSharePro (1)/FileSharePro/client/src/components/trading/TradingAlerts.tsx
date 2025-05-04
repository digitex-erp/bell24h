import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertType, TradingAlert, TradingPair } from "../../types";
import { Bell, X, Check, AlertTriangle, BarChart4, Volume2, Newspaper } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const alertFormSchema = z.object({
  pairId: z.number(),
  type: z.enum(['price', 'volume', 'technical', 'news'] as const),
  triggerValue: z.number().min(0.00001),
  comparison: z.enum(['above', 'below', 'at']),
  message: z.string().optional(),
  notifyVia: z.array(z.enum(['email', 'sms', 'app'])),
  cooldownMinutes: z.number().int().min(1).max(1440),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

interface TradingAlertsProps {
  tradingPairs: TradingPair[];
  userAlerts: TradingAlert[];
  onCreateAlert?: (alert: AlertFormValues) => void;
  onDeleteAlert?: (alertId: number) => void;
  onToggleAlert?: (alertId: number, isActive: boolean) => void;
}

export const TradingAlerts = ({ 
  tradingPairs, 
  userAlerts, 
  onCreateAlert, 
  onDeleteAlert, 
  onToggleAlert 
}: TradingAlertsProps) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
  const [selectedPair, setSelectedPair] = useState<TradingPair | undefined>(
    tradingPairs.length > 0 ? tradingPairs[0] : undefined
  );

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      pairId: selectedPair?.id,
      type: 'price',
      triggerValue: 0,
      comparison: 'above',
      message: '',
      notifyVia: ['app'],
      cooldownMinutes: 60,
    },
  });

  function onSubmit(values: AlertFormValues) {
    if (onCreateAlert) {
      onCreateAlert(values);
      form.reset();
    }
  }

  // When the selected pair changes, update the form
  const handlePairChange = (pairId: string) => {
    const pair = tradingPairs.find(p => p.id === parseInt(pairId));
    setSelectedPair(pair);
    form.setValue('pairId', parseInt(pairId));
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'price':
        return <AlertTriangle className="h-4 w-4" />;
      case 'volume':
        return <Volume2 className="h-4 w-4" />;
      case 'technical':
        return <BarChart4 className="h-4 w-4" />;
      case 'news':
        return <Newspaper className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeName = (type: AlertType) => {
    switch (type) {
      case 'price':
        return 'Price Alert';
      case 'volume':
        return 'Volume Alert';
      case 'technical':
        return 'Technical Indicator';
      case 'news':
        return 'News Alert';
      default:
        return 'Alert';
    }
  };

  // Filter alerts by the selected pair
  const filteredAlerts = selectedPair
    ? userAlerts.filter(alert => alert.pairId === selectedPair.id)
    : userAlerts;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Trading Alerts
        </CardTitle>
        <CardDescription>
          Create and manage alerts for price changes, volume spikes, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'manage')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manage">My Alerts</TabsTrigger>
            <TabsTrigger value="create">Create Alert</TabsTrigger>
          </TabsList>
          
          {/* Pair selector (shared between tabs) */}
          <div className="mb-4">
            <label className="text-sm font-medium text-neutral-700">Trading Pair</label>
            <Select 
              onValueChange={handlePairChange}
              defaultValue={selectedPair ? selectedPair.id.toString() : ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id.toString()}>
                    {pair.baseAsset}/{pair.quoteAsset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="manage">
            {filteredAlerts.length > 0 ? (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const pair = tradingPairs.find(p => p.id === alert.pairId);
                  return (
                    <div 
                      key={alert.id} 
                      className="border rounded-md p-3 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          {getAlertTypeIcon(alert.type)}
                          <span className="ml-2 font-medium">{getAlertTypeName(alert.type)}</span>
                          <Badge 
                            variant={alert.isActive ? "default" : "outline"}
                            className="ml-2"
                          >
                            {alert.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="mt-1 text-sm">
                          {pair?.baseAsset}/{pair?.quoteAsset} {alert.comparison} {alert.triggerValue}
                        </div>
                        {alert.message && (
                          <div className="mt-1 text-sm text-neutral-500">
                            "{alert.message}"
                          </div>
                        )}
                        <div className="mt-1 text-xs text-neutral-400">
                          Notify via: {alert.notifyVia.join(', ')}
                          {alert.lastTriggered && (
                            <span className="ml-2">
                              Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onToggleAlert && onToggleAlert(alert.id, !alert.isActive)}
                        >
                          {alert.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteAlert && onDeleteAlert(alert.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Bell className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
                <h3 className="text-lg font-medium">No alerts yet</h3>
                <p className="mt-1">
                  Create alerts to get notified about price movements, volume spikes, and more.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('create')}
                >
                  Create Your First Alert
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="price">Price Alert</SelectItem>
                          <SelectItem value="volume">Volume Alert</SelectItem>
                          <SelectItem value="technical">Technical Indicator</SelectItem>
                          <SelectItem value="news">News Alert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comparison"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="above">When price goes above</SelectItem>
                          <SelectItem value="below">When price falls below</SelectItem>
                          <SelectItem value="at">At exactly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="triggerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          step={selectedPair?.tickSize || 0.01}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch('type') === 'price' 
                          ? `Price in ${selectedPair?.quoteAsset}`
                          : form.watch('type') === 'volume'
                          ? '24h volume change in %'
                          : 'Threshold value'
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Message (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Add a note to your alert"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifyVia"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Notification Method</FormLabel>
                        <FormDescription>
                          Select how you want to be notified when this alert triggers.
                        </FormDescription>
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="notifyVia"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="app"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("app")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "app"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "app"
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  In-app notification
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="notifyVia"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="email"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("email")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "email"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "email"
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Email notification
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="notifyVia"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key="sms"
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("sms")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "sms"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "sms"
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  SMS notification
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cooldownMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooldown Period (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min={1}
                          max={1440}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum time between repeated notifications (1-1440 minutes)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  Create Alert
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};