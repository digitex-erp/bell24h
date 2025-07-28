import { z } from 'zod';

export const createRfqSchema = z.object({
  rfqTitle: z.string().min(5, 'RFQ title must be at least 5 characters long'),
  rfqText: z.string().min(20, 'RFQ text must be at least 20 characters long'),
  category: z.string().nonempty('Category cannot be empty'),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
  budget: z.number().positive('Budget must be a positive number').optional(),
  deadline: z.string().refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid date string' }),
});

export const updateRfqSchema = createRfqSchema.partial();

export type CreateRfqInput = z.infer<typeof createRfqSchema>;
export type UpdateRfqInput = z.infer<typeof updateRfqSchema>;
