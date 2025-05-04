import { db } from "../db";
import { suppliers } from "../../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Get a supplier by user ID
 * @param userId The ID of the user
 * @returns The supplier object if found, otherwise undefined
 */
export async function getSupplierByUserId(userId: number) {
  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}