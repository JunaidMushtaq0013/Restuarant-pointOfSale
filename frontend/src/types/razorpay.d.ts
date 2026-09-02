export {};

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
    theme?: {
      color?: string;
    };
  }

  interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  interface RazorpayInstance {
    open: () => void;
    on: (
      event: string,
      callback: (response: RazorpayPaymentFailedResponse) => void,
    ) => void;
  }

  interface RazorpayPaymentFailedResponse {
    error?: {
      description?: string;
    };
  }
}