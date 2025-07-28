import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface Device {
  id: string;
  userAgent: string;
  ipAddress: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  location?: {
    country?: string;
    city?: string;
  };
  isVerified: boolean;
  lastActive: string;
  riskScore?: number;
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await apiRequest('GET', '/api/devices');
      const data = await response.json();
      setDevices(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch devices');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to fetch devices. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/devices/${deviceId}`);
      
      if (response.ok) {
        setDevices(devices.filter(device => device.id !== deviceId));
        toast({
          title: 'Success',
          description: 'Device removed successfully.',
        });
      } else {
        setError('Failed to remove device');
      }
    } catch (error) {
      setError('Failed to remove device');
      toast({
        title: 'Error',
        description: 'Failed to remove device. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (device: Device) => {
    if (!device.isVerified) return <ShieldAlert className="text-yellow-500" />;
    if (device.riskScore && device.riskScore > 0.7) return <ShieldX className="text-red-500" />;
    return <ShieldCheck className="text-green-500" />;
  };

  const getDeviceStatus = (device: Device) => {
    if (!device.isVerified) return 'Unverified';
    if (device.riskScore && device.riskScore > 0.7) return 'High Risk';
    return 'Trusted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted Devices</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No devices found
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getDeviceIcon(device)}
                  <div>
                    <div className="font-medium">
                      {device.deviceType || 'Unknown Device'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {device.os} • {device.browser}
                    </div>
                    <div className="text-sm text-gray-500">
                      {device.location?.city}, {device.location?.country}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last active {formatDistanceToNow(new Date(device.lastActive))} ago
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      !device.isVerified
                        ? 'bg-yellow-100 text-yellow-800'
                        : device.riskScore && device.riskScore > 0.7
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getDeviceStatus(device)}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 