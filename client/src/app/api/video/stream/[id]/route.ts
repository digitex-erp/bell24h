import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const { searchParams } = new URL(request.url);
    const quality = searchParams.get('quality') || '720p';
    const format = searchParams.get('format') || 'mp4';

    // Mock video data (in production, fetch from database)
    const videoData = {
      id: videoId,
      filename: `video_${videoId}.${format}`,
      title: `Video ${videoId}`,
      description: `Video showcase for ${videoId}`,
      duration: 120, // seconds
      size: 25000000, // bytes
      quality: quality,
      format: format,
      url: `/uploads/videos/video_${videoId}.${format}`,
      thumbnail: `/uploads/videos/thumbnails/video_${videoId}.jpg`,
      uploadDate: new Date().toISOString(),
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 100) + 10
    };

    // Check if video file exists (mock for now)
    const videoPath = join(process.cwd(), 'public', 'uploads', 'videos', videoData.filename);
    
    try {
      await stat(videoPath);
    } catch (error) {
      // Video file doesn't exist, return mock data
      return NextResponse.json({
        success: true,
        message: 'Video stream endpoint working',
        data: {
          ...videoData,
          streamUrl: `/api/video/stream/${videoId}`,
          hlsUrl: `/api/video/stream/${videoId}/hls`,
          dashUrl: `/api/video/stream/${videoId}/dash`,
          qualities: ['480p', '720p', '1080p'],
          formats: ['mp4', 'webm', 'hls', 'dash']
        }
      });
    }

    // Return video stream data
    return NextResponse.json({
      success: true,
      message: 'Video stream available',
      data: {
        ...videoData,
        streamUrl: `/api/video/stream/${videoId}`,
        hlsUrl: `/api/video/stream/${videoId}/hls`,
        dashUrl: `/api/video/stream/${videoId}/dash`,
        qualities: ['480p', '720p', '1080p'],
        formats: ['mp4', 'webm', 'hls', 'dash'],
        currentQuality: quality,
        currentFormat: format
      }
    });

  } catch (error) {
    console.error('Video stream error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to stream video' },
      { status: 500 }
    );
  }
}

// HEAD request for video info
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': '25000000',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 404 });
  }
} 