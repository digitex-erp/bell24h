import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { IMPLEMENTATION_STATUS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const KredxSection = () => {
  const { toast } = useToast();
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch KredX integration status
  const { data: kredxData } = useQuery({
    queryKey: ['/api/payments/kredx/status'],
    refetchOnWindowFocus: false,
  });

  const handleDiscountInvoice = async () => {
    if (!invoiceAmount || !selectedDate) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both amount and due date.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(invoiceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, we would select a specific invoice
      await apiRequest('POST', '/api/payments/invoices/create', {
        supplierId: 1, // This would come from a selected supplier
        amount,
        dueDate: selectedDate.toISOString(),
      });

      toast({
        title: 'Invoice Submitted',
        description: 'Your invoice has been submitted for discounting.',
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/payments/invoices'] });
      
      // Reset form
      setInvoiceAmount('');
      setSelectedDate(undefined);
      setDiscountDialogOpen(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">KredX Invoice Discounting</h2>
          <span className="px-2 py-0.5 text-xs rounded-full bg-warning-100 text-warning-800">New</span>
        </div>
        <p className="text-sm text-gray-500">Get immediate liquidity on your invoices</p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Implementation</span>
          <span className="text-gray-800 font-medium">{IMPLEMENTATION_STATUS.KREDX_INTEGRATION}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-warning-500 h-2 rounded-full" 
            style={{ width: `${IMPLEMENTATION_STATUS.KREDX_INTEGRATION}%` }}
          ></div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium text-gray-700">Interest Rate</h4>
            <span className="text-sm text-success-600 font-medium">0.5% fee</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Immediate payment on approved invoices</p>
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">Processing Time</span>
            <span className="text-xs text-gray-800">24-48 hours</span>
          </div>
        </div>
        
        <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-2">
              <i className="fas fa-file-invoice-dollar mr-2"></i>
              Discount an Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice Discounting</DialogTitle>
              <DialogDescription>
                Enter invoice details to get immediate funds through KredX.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Invoice Amount (₹)</Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="due-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="pt-2 text-sm">
                <p className="text-gray-500">By proceeding, you agree to KredX's terms and conditions.</p>
                <p className="text-gray-500 mt-1">A 0.5% fee will be charged on the invoice amount.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleDiscountInvoice}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  'Submit Invoice'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" className="w-full">
          <i className="fas fa-info-circle mr-2"></i>
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default KredxSection;
