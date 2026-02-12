import { NextRequest, NextResponse } from 'next/server';
import { assemblyAIService } from '@/lib/assemblyai';
import { insforge } from '@/lib/insforge';

/**
 * POST /api/rfqs/analyze
 *
 * Analyzes voice or video RFQ using MiniMax AI
 * Automatically extracts product details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, fileUrl, userId } = body;

    if (!fileUrl || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, fileUrl, userId' },
        { status: 400 }
      );
    }

    let analysis;

    // Process based on RFQ type
    if (type === 'voice') {
      console.log('Analyzing voice RFQ with AssemblyAI...');
      analysis = await assemblyAIService.analyzeVoiceRFQ(fileUrl);

      // Save to database
      const { data: rfq, error } = await insforge.database
        .from('rfqs')
        .insert({
          user_id: userId,
          type: 'voice',
          title: analysis.productName,
          description: analysis.additionalRequirements,
          audio_url: fileUrl,
          transcription: analysis.extractedText,
          extracted_data: {
            quantity: analysis.quantity,
            unit: analysis.unit,
            deliveryTimeline: analysis.deliveryTimeline,
            location: analysis.location,
            confidence: analysis.confidence,
          },
          quantity: analysis.quantity,
          location: analysis.location,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        rfq,
        analysis,
      });

    } else if (type === 'video') {
      console.log('Analyzing video RFQ with Vision AI...');

      // For now, use basic video analysis (audio transcription + visual placeholder)
      // TODO: Integrate full vision model (OpenAI GPT-4 Vision or Google Vision API)

      // Extract audio from video using AssemblyAI
      analysis = await assemblyAIService.analyzeVoiceRFQ(fileUrl);

      // Save to database
      const { data: rfq, error } = await insforge.database
        .from('rfqs')
        .insert({
          user_id: userId,
          type: 'video',
          title: analysis.productName,
          description: analysis.visualDescription,
          video_url: fileUrl,
          extracted_data: {
            quantity: analysis.quantity,
            specifications: analysis.specifications,
            qualityRequirements: analysis.qualityRequirements,
            confidence: analysis.confidence,
          },
          quantity: analysis.quantity,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        rfq,
        analysis,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "voice" or "video"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('RFQ Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze RFQ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rfqs/analyze?rfqId=xxx
 *
 * Get analysis results for an existing RFQ
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json(
        { error: 'Missing rfqId parameter' },
        { status: 400 }
      );
    }

    const { data: rfq, error } = await insforge.database
      .from('rfqs')
      .select('*')
      .eq('id', rfqId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      rfq,
      extractedData: rfq.extracted_data,
      transcription: rfq.transcription,
    });

  } catch (error: any) {
    console.error('Get Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analysis' },
      { status: 500 }
    );
  }
}
