declare module '@paypal/react-paypal-js' {
  export interface PayPalButtonsProps {
    createOrder: () => Promise<string>;
    onApprove: (details: any) => Promise<void>;
    onError: (error: any) => void;
    style?: {
      layout?: 'vertical' | 'horizontal';
      color?: 'gold' | 'blue' | 'silver' | 'black' | 'white';
      shape?: 'rect' | 'pill';
      label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
      height?: number;
      tagline?: boolean;
    };
  }

  export const PayPalButtons: React.FC<PayPalButtonsProps>;
}

declare module '@stripe/react-stripe-js' {
  export interface CardElementProps {
    options?: {
      style?: {
        base?: {
          color?: string;
          fontFamily?: string;
          fontSize?: string;
          '::placeholder'?: {
            color?: string;
          };
        };
        invalid?: {
          color?: string;
        };
      };
    };
  }

  export const CardElement: React.FC<CardElementProps>;
  export const Elements: React.FC<{ stripe: any; options?: any }>;
  export const useStripe: () => any;
  export const useElements: () => any;
}

declare module '@stripe/stripe-js' {
  export interface StripeElementStyle {
    base?: {
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      '::placeholder'?: {
        color?: string;
      };
    };
    invalid?: {
      color?: string;
    };
  }

  export interface StripeCardElementOptions {
    style?: StripeElementStyle;
  }

  export interface StripeElements {
    create: (type: string, options?: StripeCardElementOptions) => any;
  }

  export interface Stripe {
    elements: (options?: any) => StripeElements;
    confirmCardPayment: (clientSecret: string, data: any) => Promise<any>;
  }

  export function loadStripe(publicKey: string): Promise<Stripe>;
}
