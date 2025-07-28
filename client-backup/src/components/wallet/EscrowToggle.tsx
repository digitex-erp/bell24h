'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { toast } from 'sonner';
import { formatBalance } from '@/lib/utils';

interface EscrowToggleProps {
  wallet: {
    id: string;
    isEscrowEnabled: boolean;
    escrowThreshold: number;
    currency: string;
  };
  onUpdate: () => void;
}

export function EscrowToggle({ wallet, onUpdate }: EscrowToggleProps) {
  const [isEscrowEnabled, setIsEscrowEnabled] = useState(wallet.isEscrowEnabled);
  const [escrowThreshold, setEscrowThreshold] = useState(wallet.escrowThreshold);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when wallet props change
  useEffect(() => {
    setIsEscrowEnabled(wallet.isEscrowEnabled);
    setEscrowThreshold(wallet.escrowThreshold);
  }, [wallet]);

  const handleEscrowToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          metadata: { isEnabled: checked }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update escrow settings');
      }
      
      setIsEscrowEnabled(checked);
      onUpdate();
      toast.success(`Escrow ${checked ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling escrow:', error);
      toast.error(error.message || 'Failed to update escrow settings');
      // Revert UI state on error
      setIsEscrowEnabled(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThresholdUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-threshold',
          metadata: { threshold: escrowThreshold }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update escrow threshold');
      }
      
      onUpdate();
      toast.success('Escrow threshold updated successfully');
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast.error(error.message || 'Failed to update escrow threshold');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="escrow-enabled" className="text-base">
            Enable Escrow
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically hold funds in escrow for transactions above the threshold
          </p>
        </div>
        <Switch
          id="escrow-enabled"
          checked={isEscrowEnabled}
          onCheckedChange={handleEscrowToggle}
          disabled={isUpdating}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="escrow-threshold" className="text-sm">
          Escrow Threshold ({wallet.currency})
        </Label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground">
                {wallet.currency === 'INR' ? '₹' : '$'}
              </span>
            </div>
            <Input
              id="escrow-threshold"
              type="number"
              min="0"
              step="0.01"
              value={escrowThreshold / 100} // Convert to currency units
              onChange={(e) => setEscrowThreshold(Number(e.target.value) * 100)}
              disabled={!isEscrowEnabled || isUpdating}
              className="pl-8"
            />
          </div>
          <Button 
            onClick={handleThresholdUpdate}
            disabled={!isEscrowEnabled || isUpdating || escrowThreshold === wallet.escrowThreshold}
            size="sm"
          >
            {isUpdating ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Current threshold: {formatBalance(wallet.escrowThreshold, wallet.currency)}
        </p>
      </div>
    </div>
  );
}
