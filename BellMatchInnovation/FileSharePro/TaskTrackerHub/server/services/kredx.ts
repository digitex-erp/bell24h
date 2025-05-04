import { log } from "../vite";

export interface InvoiceDiscountRequest {
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  supplierId: number;
  buyerId: number;
}

export interface InvoiceDiscountResponse {
  discountId: string;
  invoiceNumber: string;
  originalAmount: number;
  discountedAmount: number;
  discountFee: number;
  discountRate: number;
  estimatedPayout: number;
  payoutDate: Date;
  status: "pending" | "accepted" | "rejected" | "completed";
}

export class KredXService {
  private apiKey: string;
  private isInitialized: boolean;
  
  constructor() {
    this.apiKey = process.env.KREDX_API_KEY || "";
    this.isInitialized = !!this.apiKey;
    
    if (!this.isInitialized) {
      log("Warning: KredX API key not set. Invoice discounting will be simulated.", "kredx");
    }
  }
  
  /**
   * Calculates the discount fee for an invoice
   * @param amount Invoice amount
   * @param daysToMaturity Days until the invoice is due
   * @returns Discount fee percentage
   */
  calculateDiscountRate(amount: number, daysToMaturity: number): number {
    // Simple algorithm to determine discount rate
    // Higher amounts and shorter maturity periods get better rates
    let baseRate = 3.5; // 3.5% base rate
    
    // Adjust for amount (larger invoices get better rates)
    if (amount > 500000) baseRate -= 0.5;
    else if (amount > 100000) baseRate -= 0.3;
    
    // Adjust for maturity (shorter periods get better rates)
    if (daysToMaturity < 15) baseRate -= 0.2;
    else if (daysToMaturity > 45) baseRate += 0.3;
    
    return Math.max(1.5, Math.min(5.0, baseRate)); // Cap between 1.5% and 5%
  }
  
  /**
   * Create an invoice discount request
   * @param request Invoice discount details
   * @returns Response with discount details
   */
  async createInvoiceDiscount(request: InvoiceDiscountRequest): Promise<InvoiceDiscountResponse> {
    try {
      const daysToMaturity = Math.ceil((request.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const discountRate = this.calculateDiscountRate(request.amount, daysToMaturity);
      const discountFee = (request.amount * discountRate) / 100;
      const discountedAmount = request.amount - discountFee;
      
      // If API key is set, make the actual API call
      if (this.isInitialized) {
        // KredX API endpoint would go here
        // Implement when API documentation is available
        
        // For now, return simulated result
        log("KredX API call would be made here", "kredx");
      }
      
      // When API not configured or for development, return a simulated response
      return {
        discountId: `kredx_${Date.now()}_${request.invoiceNumber}`,
        invoiceNumber: request.invoiceNumber,
        originalAmount: request.amount,
        discountedAmount: discountedAmount,
        discountFee: discountFee,
        discountRate: discountRate,
        estimatedPayout: discountedAmount,
        payoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day payout
        status: "pending"
      };
    } catch (error) {
      log(`Error creating invoice discount: ${error}`, "kredx");
      throw error;
    }
  }
  
  /**
   * Gets the status of an invoice discount request
   * @param discountId ID of the discount request
   * @returns Current status of the discount request
   */
  async getDiscountStatus(discountId: string): Promise<InvoiceDiscountResponse> {
    try {
      // If API key is set, make the actual API call
      if (this.isInitialized) {
        // KredX API endpoint would go here
        // Implement when API documentation is available
        
        // For now, return simulated result
        log("KredX API call would be made here", "kredx");
      }
      
      // Parse the discount ID to extract invoice number
      const parts = discountId.split('_');
      const invoiceNumber = parts[parts.length - 1];
      
      // When API not configured or for development, return a simulated response
      return {
        discountId: discountId,
        invoiceNumber: invoiceNumber,
        originalAmount: 120000,
        discountedAmount: 115800,
        discountFee: 4200,
        discountRate: 3.5,
        estimatedPayout: 115800,
        payoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day payout
        status: "pending"
      };
    } catch (error) {
      log(`Error fetching discount status: ${error}`, "kredx");
      throw error;
    }
  }
  
  /**
   * Accepts a discount offer
   * @param discountId ID of the discount to accept
   * @returns Updated discount status
   */
  async acceptDiscountOffer(discountId: string): Promise<InvoiceDiscountResponse> {
    try {
      // If API key is set, make the actual API call
      if (this.isInitialized) {
        // KredX API endpoint would go here
        // Implement when API documentation is available
        
        // For now, return simulated result
        log("KredX API call would be made here", "kredx");
      }
      
      // Get the current status first
      const currentStatus = await this.getDiscountStatus(discountId);
      
      // Return updated status
      return {
        ...currentStatus,
        status: "accepted",
        payoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day payout
      };
    } catch (error) {
      log(`Error accepting discount offer: ${error}`, "kredx");
      throw error;
    }
  }
}

// Create singleton instance
export const kredxService = new KredXService();
