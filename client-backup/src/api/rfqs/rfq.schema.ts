import { z } from 'zod';

export const createRfqSchema = z.object({
  // We'll validate the request body
  body: z.object({
    rfqText:
      z.string({
        required_error: 'RFQ text is required',
      }).min(20, 'RFQ text must be at least 20 characters long'),

    category: z.string({
      required_error: 'Category is required',
    }),

    quantity:
      z.number({
        required_error: 'Quantity is required',
      }).positive('Quantity must be a positive number'),

    requiredCertifications:
      z.array(z.string(), {
        invalid_type_error: 'Certifications must be an array of strings',
      }).optional(), // Make this field optional

    destination: z.string({
      required_error: 'Destination is required',
    }),
  }),
});
