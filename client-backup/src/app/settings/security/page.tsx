import React from 'react';
import { DeviceManagement } from '@/components/security/DeviceManagement';
import { MFASetup } from '@/components/security/MFASetup';

export default function SecuritySettings() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Security Settings</h1>
      
      <div className="grid gap-8">
        <MFASetup />
        <DeviceManagement />
      </div>
    </div>
  );
} 