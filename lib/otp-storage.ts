// Shared OTP storage for development
// In production, use Redis or database

interface OTPData {
  otp: string;
  timestamp: number;
}

class OTPStorage {
  private storage = new Map<string, OTPData>();

  set(mobile: string, otp: string): void {
    this.storage.set(mobile, {
      otp,
      timestamp: Date.now()
    });
  }

  get(mobile: string): OTPData | undefined {
    return this.storage.get(mobile);
  }

  delete(mobile: string): boolean {
    return this.storage.delete(mobile);
  }

  isExpired(timestamp: number, expiryMinutes: number = 5): boolean {
    return Date.now() - timestamp > expiryMinutes * 60 * 1000;
  }
}

// Export singleton instance
export const otpStorage = new OTPStorage();