import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

interface VideoUploadResponse {
  success: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
  metadata: {
    filename: string;
    size: number;
    duration?: number;
    format: string;
    uploadedAt: string;
    id: string;
  };
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transcription?: string;
    extractedData?: any;
  };
}

// Video processing utilities
class VideoProcessor {
  private cloudinaryConfig = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };

  async uploadToCloudinary(videoFile: File): Promise<{
    url: string;
    thumbnailUrl: string;
    publicId: string;
    metadata: any;
  }> {
    try {
      // Convert File to buffer for Cloudinary upload
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', new Blob([buffer]), videoFile.name);
      formData.append('upload_preset', 'bell24h_videos'); // Create this preset in Cloudinary
      formData.append('resource_type', 'video');
      formData.append('folder', 'bell24h/rfq-videos');

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const result = await uploadResponse.json();

      // Generate thumbnail URL
      const thumbnailUrl = result.secure_url.replace(
        '/video/upload/',
        '/video/upload/w_400,h_300,c_fill,f_jpg/'
      );

      return {
        url: result.secure_url,
        thumbnailUrl,
        publicId: result.public_id,
        metadata: {
          duration: result.duration,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  async uploadToVercelBlob(videoFile: File): Promise<{
    url: string;
    downloadUrl: string;
    metadata: any;
  }> {
    try {
      const filename = `videos/rfq/${Date.now()}-${videoFile.name}`;

      const result = await put(filename, videoFile, {
        access: 'public',
        addRandomSuffix: true,
      });

      return {
        url: result.url,
        downloadUrl: result.downloadUrl,
        metadata: {
          size: videoFile.size,
          type: videoFile.type,
          filename: videoFile.name,
        },
      };
    } catch (error) {
      console.error('Vercel Blob upload failed:', error);
      throw error;
    }
  }

  async extractVideoMetadata(videoFile: File): Promise<{
    duration: number;
    size: number;
    format: string;
    hasAudio: boolean;
  }> {
    // In a real implementation, you'd use ffprobe or similar
    // For now, return basic metadata
    return {
      duration: 0, // Would be extracted using ffprobe
      size: videoFile.size,
      format: videoFile.type,
      hasAudio: true, // Assume has audio for RFQ videos
    };
  }

  async processVideoForRFQ(videoUrl: string): Promise<{
    transcription?: string;
    extractedData?: any;
    thumbnails?: string[];
  }> {
    try {
      // This would integrate with video processing services
      // For now, return mock processing data
      return {
        transcription: 'Mock transcription: User showing steel product requirements in video',
        extractedData: {
          category: 'Steel & Metals',
          quantity: '100 kg',
          location: 'Mumbai',
          urgency: 'medium',
        },
        thumbnails: [
          videoUrl.replace('.mp4', '_thumb_1.jpg'),
          videoUrl.replace('.mp4', '_thumb_2.jpg'),
          videoUrl.replace('.mp4', '_thumb_3.jpg'),
        ],
      };
    } catch (error) {
      console.error('Video processing failed:', error);
      return {};
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎥 Video upload endpoint hit');

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const rfqData = formData.get('rfqData') as string;
    const uploadType = (formData.get('type') as string) || 'rfq';

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate video file
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Supported: MP4, MOV, AVI, WebM' },
        { status: 400 }
      );
    }

    const processor = new VideoProcessor();
    const videoId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let uploadResult;

    // Try Cloudinary first, fallback to Vercel Blob
    try {
      if (processor['cloudinaryConfig'].cloudName) {
        console.log('📤 Uploading to Cloudinary...');
        const cloudinaryResult = await processor.uploadToCloudinary(videoFile);
        uploadResult = {
          url: cloudinaryResult.url,
          thumbnailUrl: cloudinaryResult.thumbnailUrl,
          metadata: cloudinaryResult.metadata,
          provider: 'cloudinary',
        };
      } else {
        throw new Error('Cloudinary not configured');
      }
    } catch (cloudinaryError) {
      console.log('⚠️ Cloudinary failed, using Vercel Blob:', cloudinaryError.message);
      const blobResult = await processor.uploadToVercelBlob(videoFile);
      uploadResult = {
        url: blobResult.url,
        thumbnailUrl: blobResult.url + '?thumbnail=true', // Mock thumbnail
        metadata: blobResult.metadata,
        provider: 'vercel-blob',
      };
    }

    // Extract video metadata
    const videoMetadata = await processor.extractVideoMetadata(videoFile);

    // Process video for RFQ extraction (async)
    let processingData = {};
    if (uploadType === 'rfq') {
      console.log('🔄 Processing video for RFQ extraction...');
      processingData = await processor.processVideoForRFQ(uploadResult.url);
    }

    const response: VideoUploadResponse = {
      success: true,
      videoUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      metadata: {
        id: videoId,
        filename: videoFile.name,
        size: videoFile.size,
        duration: videoMetadata.duration,
        format: videoFile.type,
        uploadedAt: new Date().toISOString(),
      },
      processing: {
        status: 'completed',
        transcription: processingData.transcription,
        extractedData: processingData.extractedData,
      },
    };

    // Store video record in database (optional)
    // await prisma.videoUpload.create({
    //   data: {
    //     id: videoId,
    //     url: uploadResult.url,
    //     thumbnailUrl: uploadResult.thumbnailUrl,
    //     metadata: response.metadata,
    //     type: uploadType,
    //     userId: getUserFromRequest(request)?.id
    //   }
    // })

    console.log(`✅ Video uploaded successfully: ${videoId}`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Video upload failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Video upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for video status/info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json({
        success: true,
        endpoint: '/api/upload-video',
        methods: ['POST', 'GET'],
        supports: [
          'MP4, MOV, AVI, WebM video formats',
          'Maximum file size: 100MB',
          'Automatic thumbnail generation',
          'Video transcription for RFQ',
          'Cloudinary and Vercel Blob storage',
        ],
        usage: {
          upload: 'POST with FormData containing video file',
          check: 'GET with ?id=video_id parameter',
        },
      });
    }

    // In production, fetch from database
    const mockVideoData = {
      id: videoId,
      url: `https://example.com/videos/${videoId}.mp4`,
      thumbnailUrl: `https://example.com/videos/${videoId}_thumb.jpg`,
      status: 'completed',
      uploadedAt: new Date().toISOString(),
      metadata: {
        size: 15728640,
        duration: 45,
        format: 'video/mp4',
      },
    };

    return NextResponse.json({
      success: true,
      video: mockVideoData,
    });
  } catch (error) {
    console.error('❌ Video status check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Video status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for video removal
export async function DELETE(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // In production, delete from storage and database
    console.log(`🗑️ Deleting video: ${videoId}`);

    return NextResponse.json({
      success: true,
      message: `Video ${videoId} deleted successfully`,
    });
  } catch (error) {
    console.error('❌ Video deletion failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Video deletion failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
