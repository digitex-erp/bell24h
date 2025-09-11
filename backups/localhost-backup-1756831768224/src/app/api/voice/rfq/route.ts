import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'list') {
      // Mock voice RFQ list
      const voiceRFQs = [
        {
          id: 'VRFQ_001',
          title: 'Electronics Components Supply',
          description: 'Need electronic components for manufacturing',
          audioUrl: '/audio/rfq_001.mp3',
          duration: '2:34',
          status: 'active',
          createdAt: new Date().toISOString(),
          responses: 5
        },
        {
          id: 'VRFQ_002',
          title: 'Industrial Machinery Parts',
          description: 'Seeking industrial machinery replacement parts',
          audioUrl: '/audio/rfq_002.mp3',
          duration: '1:45',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          responses: 8
        }
      ];

      return NextResponse.json({
        success: true,
        data: voiceRFQs,
        message: 'Voice RFQs retrieved successfully'
      });
    }

    // Default voice RFQ info
    const voiceRFQInfo = {
      totalActive: 12,
      totalCompleted: 45,
      averageResponseTime: '2.3 hours',
      successRate: '87%',
      lastCreated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: voiceRFQInfo,
      message: 'Voice RFQ information retrieved successfully'
    });

  } catch (error) {
    console.error('Voice RFQ API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve voice RFQ information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, audioFile, category } = body;

    // Mock voice RFQ creation
    const newVoiceRFQ = {
      id: `VRFQ_${Date.now()}`,
      title,
      description,
      audioUrl: audioFile || '/audio/default.mp3',
      duration: '0:00',
      status: 'active',
      createdAt: new Date().toISOString(),
      responses: 0,
      category: category || 'general'
    };

    return NextResponse.json({
      success: true,
      data: newVoiceRFQ,
      message: 'Voice RFQ created successfully'
    });

  } catch (error) {
    console.error('Voice RFQ POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create voice RFQ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
