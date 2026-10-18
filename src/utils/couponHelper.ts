export interface CouponResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  description: string;
  errorMessage?: string;
}

export const VALID_COUPONS: Record<string, { percent: number; description: string }> = {
  SNAP15: { percent: 15, description: '15% Welcome Privilege Discount' },
  FIRST15: { percent: 15, description: '15% First-time Creator Discount' },
  VIP20: { percent: 20, description: '20% VIP Client Discount' },
  ELITE20: { percent: 20, description: '20% Snap Shots Elite Discount' },
  REEL10: { percent: 10, description: '10% Content Creator Discount' },
  SAVE10: { percent: 10, description: '10% Weekend Promo Discount' },
  CREATOR25: { percent: 25, description: '25% Creator Partner Discount' },
};

/**
 * Validates a coupon code string (case-insensitive).
 */
export function validateCoupon(rawCode: string): CouponResult {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      code: '',
      discountPercent: 0,
      description: '',
      errorMessage: 'Please enter a coupon code.',
    };
  }

  const match = VALID_COUPONS[code];
  if (match) {
    return {
      valid: true,
      code,
      discountPercent: match.percent,
      description: match.description,
    };
  }

  return {
    valid: false,
    code,
    discountPercent: 0,
    description: '',
    errorMessage: `Invalid coupon "${code}". Try SNAP15 for 15% off!`,
  };
}

/**
 * Calculate discounted price string preserving currency symbols.
 * Handles inputs like "₹4,999", "$149", "₹12,499", "$499".
 */
export function calculateDiscountedPrice(priceStr?: string, discountPercent: number = 0): {
  discountedPrice?: string;
  savedAmount?: string;
  numericOriginal?: number;
  numericDiscounted?: number;
} {
  if (!priceStr) return {};

  // Extract currency symbol if present
  const symbolMatch = priceStr.match(/^([^0-9]+)/);
  const symbol = symbolMatch ? symbolMatch[1].trim() : '';

  // Extract numeric digits
  const numericOnly = priceStr.replace(/[^0-9]/g, '');
  const originalVal = parseInt(numericOnly, 10);

  if (isNaN(originalVal) || originalVal <= 0 || discountPercent <= 0) {
    return { discountedPrice: priceStr, numericOriginal: originalVal };
  }

  const discountAmount = Math.round((originalVal * discountPercent) / 100);
  const finalVal = Math.max(0, originalVal - discountAmount);

  const formattedFinal = symbol
    ? `${symbol}${finalVal.toLocaleString('en-US')}`
    : finalVal.toLocaleString('en-US');

  const formattedSaved = symbol
    ? `${symbol}${discountAmount.toLocaleString('en-US')}`
    : discountAmount.toLocaleString('en-US');

  return {
    discountedPrice: formattedFinal,
    savedAmount: formattedSaved,
    numericOriginal: originalVal,
    numericDiscounted: finalVal,
  };
}
