import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MilestonePayments from "@/components/payments/milestone-payments";
import InvoiceDiscounting from "@/components/payments/invoice-discounting";

export default function PaymentAndFinancials() {
  // Fetch wallet data
  const { data: walletData, isLoading: walletLoading } = useQuery({ 
    queryKey: ['/api/wallet']
  });

  // Fetch payments data for milestone payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({ 
    queryKey: ['/api/payments']
  });

  const milestonePayments = payments?.filter(p => p.type === 'milestone') || [];
  const invoicePayments = payments?.filter(p => p.type === 'invoice') || [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">Financial Tools</h2>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
        </div>

        {/* Wallet Card */}
        <div className="p-4 mb-4 border border-dark-200 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700">
          <div className="text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Escrow Wallet</h3>
              <span className="text-xs opacity-70">RazorpayX Powered</span>
            </div>
            <div className="mt-4">
              <div className="text-xs opacity-70">Available Balance</div>
              <div className="text-xl font-bold">
                {walletLoading ? (
                  "Loading..."
                ) : (
                  `₹${parseFloat(walletData?.balance || "0").toLocaleString()}`
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button size="sm" className="px-3 py-1 text-xs text-primary-700 bg-white hover:bg-gray-100">
                Add Funds
              </Button>
              <Button size="sm" className="px-3 py-1 text-xs text-primary-700 bg-white hover:bg-gray-100">
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Milestone Payments */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-dark-700">Milestone Payments</h3>
          {paymentsLoading ? (
            <p className="text-sm text-dark-500">Loading milestone payments...</p>
          ) : milestonePayments.length > 0 ? (
            <div className="space-y-2">
              {milestonePayments.slice(0, 1).map(payment => (
                <div key={payment.id} className="p-3 border border-dark-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-800">RFQ-{payment.rfqId}</p>
                      <p className="text-xs text-dark-500">
                        Milestone {payment.milestoneNumber}/{payment.milestoneTotal}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-dark-800">₹{parseFloat(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-green-600">Ready for Release</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${payment.milestonePercent || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-dark-500">
                      <span>Milestone {payment.milestoneNumber}/{payment.milestoneTotal}</span>
                      <span>{payment.milestonePercent || 0}% Complete</span>
                    </div>
                  </div>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <p className="text-xs text-center text-primary-600 hover:text-primary-700 cursor-pointer">
                    View All Milestone Payments
                  </p>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Milestone Payments</DialogTitle>
                  </DialogHeader>
                  <MilestonePayments />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <p className="text-sm text-dark-500">No milestone payments available.</p>
          )}
        </div>

        {/* Invoice Discounting */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-dark-700">Invoice Discounting (KredX)</h3>
          {paymentsLoading ? (
            <p className="text-sm text-dark-500">Loading invoice data...</p>
          ) : invoicePayments.length > 0 ? (
            <div className="p-3 border border-dark-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-800">Invoice #{invoicePayments[0].invoiceNumber}</p>
                  <p className="text-xs text-dark-500">
                    Due in {Math.ceil((new Date(invoicePayments[0].invoiceDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-dark-800">₹{parseFloat(invoicePayments[0].amount).toLocaleString()}</p>
                  <Button size="sm" className="px-2 py-1 mt-1 text-xs text-white bg-accent-500 hover:bg-accent-600">
                    Get Early Payment
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 mt-2 text-xs bg-dark-50 rounded-md text-dark-500">
                <span>Discount Fee: {parseFloat(invoicePayments[0].discountFee || "0") / parseFloat(invoicePayments[0].amount) * 100}%</span>
                <span>You'll Receive: ₹{(parseFloat(invoicePayments[0].amount) - parseFloat(invoicePayments[0].discountFee || "0")).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 border border-dark-200 rounded-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-dark-500">No invoices available for discounting</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Explore Invoice Discounting
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Invoice Discounting</DialogTitle>
                    </DialogHeader>
                    <InvoiceDiscounting />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
