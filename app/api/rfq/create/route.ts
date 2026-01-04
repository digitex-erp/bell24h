import { NextRequest, NextResponse } from 'next/server';
import { insforge, db, handleInsForgeError } from '@/lib/insforge';

/**
 * ✅ PRODUCTION-READY RFQ Creation API
 * Connected to InsForge PostgreSQL database
 * Replaces demo mode with real database operations
 */
export async function POST(request: NextRequest) {
  try {
    const rfqData = await request.json();

    // Validation
    if (!rfqData || !rfqData.title || !rfqData.category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const { data: { user }, error: authError } = await insforge.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Calculate expiry date
    const timeline = rfqData.timeline || '2 weeks';
    const closesAt = calculateExpiryDate(timeline);

    // Prepare RFQ data for database
    const rfqInsertData = {
      user_id: user.id,
      title: rfqData.title,
      description: rfqData.description || null,
      category_id: rfqData.category_id || null,
      category_path: rfqData.category || '', // Fallback to string category

      // Multi-modal support
      type: rfqData.type || 'text',
      audio_url: rfqData.audio_url || null,
      video_url: rfqData.video_url || null,
      image_urls: rfqData.image_urls || null,
      transcription: rfqData.transcription || null,
      extracted_data: rfqData.extracted_data || null,

      // Requirements
      quantity: parseInt(rfqData.quantity) || null,
      unit: rfqData.unit || null,
      required_by_date: rfqData.required_by_date || null,
      delivery_location: rfqData.delivery_location || null,

      // Specifications
      specifications: rfqData.specifications || null,
      attachments: rfqData.attachments || null,

      // Status
      status: 'open',
      visibility: rfqData.visibility || 'public',
      invited_supplier_ids: rfqData.invited_supplier_ids || null,

      // Budget
      budget_min: parseFloat(rfqData.minBudget) || null,
      budget_max: parseFloat(rfqData.maxBudget) || null,
      currency: 'INR',
      payment_terms: rfqData.payment_terms || null,

      // Timestamps
      published_at: new Date().toISOString(),
      closes_at: closesAt
    };

    // 🔥 SAVE TO DATABASE (REAL OPERATION)
    const { data: rfq, error: insertError } = await db.rfqs()
      .insert(rfqInsertData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      const errorResponse = handleInsForgeError(insertError);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.code }
      );
    }

    // Find and notify matching suppliers (async background task)
    const matchedSuppliers = await findAndNotifySuppliers(rfq);

    // Create notification for user
    await db.notifications().insert({
      user_id: user.id,
      type: 'rfq_created',
      title: 'RFQ Created Successfully',
      message: `Your RFQ "${rfq.title}" has been published and ${matchedSuppliers.length} suppliers have been notified.`,
      related_entity_type: 'rfq',
      related_entity_id: rfq.id,
      action_url: `/rfq/${rfq.id}`,
      action_label: 'View RFQ'
    });

    return NextResponse.json({
      success: true,
      rfq: rfq,
      message: 'RFQ created and saved to database successfully',
      matchedSuppliers: matchedSuppliers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}

function generateRFQId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RFQ-${timestamp}-${random}`.toUpperCase();
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const commonTags = [
    'urgent', 'bulk', 'custom', 'quality', 'certified', 'branded',
    'steel', 'cotton', 'electronic', 'construction', 'chemical',
    'machinery', 'packaging', 'automotive', 'pharmaceutical'
  ];
  
  return commonTags.filter(tag => text.includes(tag));
}

function calculateExpiryDate(timeline: string): string {
  const now = new Date();
  let days = 30; // Default 30 days
  
  if (timeline.includes('week')) {
    const weeks = parseInt(timeline.match(/\d+/)?.[0] || '2');
    days = weeks * 7;
  } else if (timeline.includes('month')) {
    const months = parseInt(timeline.match(/\d+/)?.[0] || '1');
    days = months * 30;
  } else if (timeline.includes('day')) {
    days = parseInt(timeline.match(/\d+/)?.[0] || '30');
  }
  
  const expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  return expiryDate.toISOString();
}

function calculatePriority(urgency: string, timeline: string): number {
  let priority = 1; // Low priority
  
  if (urgency === 'urgent') priority = 5;
  else if (urgency === 'high') priority = 4;
  else if (urgency === 'normal') priority = 3;
  else if (urgency === 'low') priority = 2;
  
  // Adjust based on timeline
  if (timeline.includes('day') && parseInt(timeline) <= 7) priority += 1;
  if (timeline.includes('week') && parseInt(timeline) <= 2) priority += 1;
  
  return Math.min(priority, 5);
}

function calculateEstimatedValue(minBudget: string, maxBudget: string): number {
  const min = parseFloat(minBudget) || 0;
  const max = parseFloat(maxBudget) || 0;
  
  if (min > 0 && max > 0) {
    return (min + max) / 2;
  } else if (min > 0) {
    return min * 1.5; // Estimate 50% higher
  } else if (max > 0) {
    return max * 0.7; // Estimate 30% lower
  }
  
  return 0; // Unknown value
}

/**
 * 🔥 REAL SUPPLIER MATCHING (Database Query)
 * Finds suppliers that match the RFQ category
 */
async function findAndNotifySuppliers(rfq: any): Promise<any[]> {
  try {
    // Query suppliers table for matching categories
    const { data: suppliers, error } = await db.suppliers()
      .select('*')
      .contains('categories', [rfq.category_id])
      .eq('is_active', true)
      .eq('verified', true)
      .order('rating', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error finding suppliers:', error);
      return [];
    }

    if (!suppliers || suppliers.length === 0) {
      return [];
    }

    // Create notifications for each matched supplier
    const notifications = suppliers.map(supplier => ({
      user_id: supplier.user_id,
      type: 'new_rfq_match',
      title: 'New RFQ Match Found',
      message: `A new RFQ "${rfq.title}" matches your business categories`,
      related_entity_type: 'rfq',
      related_entity_id: rfq.id,
      action_url: `/rfq/${rfq.id}`,
      action_label: 'View RFQ & Quote'
    }));

    // Batch insert notifications
    await db.notifications().insert(notifications);

    console.log(`✅ Notified ${suppliers.length} suppliers about RFQ ${rfq.id}`);

    return suppliers;

  } catch (error) {
    console.error('Error in findAndNotifySuppliers:', error);
    return [];
  }
}