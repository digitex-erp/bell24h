import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Mock user videos data (in production, fetch from database)
    const userVideos = [
      {
        id: '1',
        userId: userId,
        title: 'Company Introduction Video',
        description: 'Welcome to our company and our manufacturing capabilities',
        filename: 'company_intro.mp4',
        url: '/uploads/videos/company_intro.mp4',
        thumbnail: '/uploads/videos/thumbnails/company_intro.jpg',
        duration: 180, // seconds
        size: 45000000, // bytes
        quality: '1080p',
        format: 'mp4',
        type: 'showcase',
        category: 'company',
        uploadDate: new Date('2024-01-15').toISOString(),
        views: 1250,
        likes: 89,
        shares: 23,
        tags: ['manufacturing', 'company', 'introduction']
      },
      {
        id: '2',
        userId: userId,
        title: 'Factory Tour Video',
        description: 'Detailed tour of our manufacturing facility',
        filename: 'factory_tour.mp4',
        url: '/uploads/videos/factory_tour.mp4',
        thumbnail: '/uploads/videos/thumbnails/factory_tour.jpg',
        duration: 240,
        size: 65000000,
        quality: '1080p',
        format: 'mp4',
        type: 'showcase',
        category: 'facility',
        uploadDate: new Date('2024-01-20').toISOString(),
        views: 890,
        likes: 67,
        shares: 15,
        tags: ['factory', 'tour', 'facility', 'manufacturing']
      },
      {
        id: '3',
        userId: userId,
        title: 'Product Demo Video',
        description: 'Demonstration of our latest product line',
        filename: 'product_demo.mp4',
        url: '/uploads/videos/product_demo.mp4',
        thumbnail: '/uploads/videos/thumbnails/product_demo.jpg',
        duration: 120,
        size: 35000000,
        quality: '720p',
        format: 'mp4',
        type: 'product',
        category: 'product',
        uploadDate: new Date('2024-01-25').toISOString(),
        views: 567,
        likes: 45,
        shares: 12,
        tags: ['product', 'demo', 'showcase']
      },
      {
        id: '4',
        userId: userId,
        title: 'Quality Control Process',
        description: 'Overview of our quality control procedures',
        filename: 'quality_control.mp4',
        url: '/uploads/videos/quality_control.mp4',
        thumbnail: '/uploads/videos/thumbnails/quality_control.jpg',
        duration: 150,
        size: 40000000,
        quality: '720p',
        format: 'mp4',
        type: 'showcase',
        category: 'quality',
        uploadDate: new Date('2024-01-30').toISOString(),
        views: 423,
        likes: 34,
        shares: 8,
        tags: ['quality', 'control', 'process']
      },
      {
        id: '5',
        userId: userId,
        title: 'RFQ Response Video',
        description: 'Detailed response to RFQ requirements',
        filename: 'rfq_response.mp4',
        url: '/uploads/videos/rfq_response.mp4',
        thumbnail: '/uploads/videos/thumbnails/rfq_response.jpg',
        duration: 90,
        size: 25000000,
        quality: '720p',
        format: 'mp4',
        type: 'rfq',
        category: 'rfq',
        uploadDate: new Date('2024-02-01').toISOString(),
        views: 234,
        likes: 18,
        shares: 5,
        tags: ['rfq', 'response', 'proposal']
      }
    ];

    // Filter videos by type if specified
    const filteredVideos = type === 'all' 
      ? userVideos 
      : userVideos.filter(video => video.type === type);

    // Apply pagination
    const paginatedVideos = filteredVideos.slice(offset, offset + limit);

    // Calculate statistics
    const totalVideos = filteredVideos.length;
    const totalViews = filteredVideos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = filteredVideos.reduce((sum, video) => sum + video.likes, 0);
    const totalDuration = filteredVideos.reduce((sum, video) => sum + video.duration, 0);

    return NextResponse.json({
      success: true,
      message: 'User videos retrieved successfully',
      data: {
        videos: paginatedVideos,
        pagination: {
          total: totalVideos,
          limit,
          offset,
          hasMore: offset + limit < totalVideos
        },
        statistics: {
          totalVideos,
          totalViews,
          totalLikes,
          totalDuration,
          averageViews: Math.round(totalViews / totalVideos),
          averageLikes: Math.round(totalLikes / totalVideos)
        },
        user: {
          id: userId,
          name: 'Bell24h User',
          company: 'Bell24h Manufacturing',
          videoCount: totalVideos
        }
      }
    });

  } catch (error) {
    console.error('User videos fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user videos' },
      { status: 500 }
    );
  }
} 