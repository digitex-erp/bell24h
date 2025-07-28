import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface VideoMetadata {
  filename: string;
  originalName: string;
  size: number;
  duration: number;
  format: string;
  resolution: string;
  uploadDate: string;
  userId: string;
  type: 'rfq' | 'product' | 'showcase';
  relatedId?: string; // RFQ ID or Product ID
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as 'rfq' | 'product' | 'showcase';
    const relatedId = formData.get('relatedId') as string;

    if (!videoFile || !userId || !type) {
      return NextResponse.json(
        { error: 'Video file, userId, and type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Supported formats: MP4, WebM, AVI, MOV' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size: 100MB' },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = videoFile.name.split('.').pop();
    const filename = `${type}_${userId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, filename);

    // Save video file
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Extract video metadata (mock for now, in production use ffmpeg)
    const metadata: VideoMetadata = {
      filename,
      originalName: videoFile.name,
      size: videoFile.size,
      duration: 0, // Would be extracted using ffmpeg
      format: fileExtension || 'mp4',
      resolution: '1920x1080', // Would be extracted using ffmpeg
      uploadDate: new Date().toISOString(),
      userId,
      type,
      relatedId
    };

    // Generate video URLs
    const videoUrl = `/uploads/videos/${filename}`;
    const thumbnailUrl = `/uploads/videos/thumbnails/${filename.replace(/\.[^/.]+$/, '.jpg')}`;

    // Process video (generate thumbnail, optimize, etc.)
    const processingResult = await processVideo(filePath, filename);

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        metadata,
        urls: {
          video: videoUrl,
          thumbnail: thumbnailUrl
        },
        processing: processingResult
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video', details: error },
      { status: 500 }
    );
  }
}

async function processVideo(filePath: string, filename: string) {
  // Mock video processing (in production, use ffmpeg)
  const processingResult = {
    status: 'completed',
    thumbnailGenerated: true,
    optimized: true,
    duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
    resolution: '1920x1080',
    fileSize: Math.floor(Math.random() * 50000000) + 1000000, // 1-50MB
    format: 'mp4',
    codec: 'H.264',
    bitrate: '2Mbps'
  };

  // In production, you would:
  // 1. Generate thumbnail using ffmpeg
  // 2. Optimize video for web playback
  // 3. Create multiple quality versions
  // 4. Upload to CDN (AWS S3, Cloudinary, etc.)

  return processingResult;
}

// GET endpoint to retrieve video metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Mock video metadata (in production, fetch from database)
    const videos: VideoMetadata[] = [
      {
        filename: 'rfq_user123_1703123456789.mp4',
        originalName: 'product_demo.mp4',
        size: 25000000,
        duration: 120,
        format: 'mp4',
        resolution: '1920x1080',
        uploadDate: new Date().toISOString(),
        userId,
        type: 'rfq',
        relatedId: 'rfq_001'
      },
      {
        filename: 'product_user123_1703123456790.mp4',
        originalName: 'factory_tour.mp4',
        size: 45000000,
        duration: 180,
        format: 'mp4',
        resolution: '1920x1080',
        uploadDate: new Date().toISOString(),
        userId,
        type: 'product',
        relatedId: 'prod_001'
      }
    ];

    const filteredVideos = type 
      ? videos.filter(v => v.type === type)
      : videos;

    return NextResponse.json({
      success: true,
      data: {
        videos: filteredVideos,
        totalCount: filteredVideos.length
      }
    });

  } catch (error) {
    console.error('Video metadata fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video metadata', details: error },
      { status: 500 }
    );
  }
} 