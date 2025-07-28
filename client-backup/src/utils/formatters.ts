/**
 * Utility functions for formatting data for UI display
 */

/**
 * Format a date for display
 * @param date Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format a currency value for display
 * @param amount Amount to format
 * @param currency Currency code (default: ETH)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency = 'ETH'
): string {
  if (amount === undefined || amount === null) return 'N/A';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Invalid Amount';
  }
  
  if (currency === 'ETH') {
    // Format as ETH with up to 6 decimal places
    return `Ξ ${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })}`;
  } else {
    // Format with local currency settings
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  }
}

/**
 * Format a wallet address for display (truncated)
 * @param address Ethereum/blockchain address
 * @param prefixLength Number of characters to show at the beginning
 * @param suffixLength Number of characters to show at the end
 * @returns Formatted address
 */
export function formatAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string {
  if (!address) return 'N/A';
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * Format a percentage value
 * @param value Value to format as percentage
 * @param decimalPlaces Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | undefined | null,
  decimalPlaces = 2
): string {
  if (value === undefined || value === null) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'Invalid Value';
  }
  
  return `${numValue.toFixed(decimalPlaces)}%`;
}

/**
 * Format a file size in bytes to human-readable format
 * @param bytes Size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}
