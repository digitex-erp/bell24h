import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Mock product videos data (in production, fetch from database)
    const productVideos = [
      {
        id: '1',
        productId: productId,
        title: 'Product Overview Video',
        description: 'Complete overview of product features and specifications',
        filename: 'product_overview.mp4',
        url: '/uploads/videos/product_overview.mp4',
        thumbnail: '/uploads/videos/thumbnails/product_overview.jpg',
        duration: 120, // seconds
        size: 35000000, // bytes
        quality: '1080p',
        format: 'mp4',
        type: 'overview',
        category: 'product',
        uploadDate: new Date('2024-01-15').toISOString(),
        views: 890,
        likes: 67,
        shares: 12,
        tags: ['product', 'overview', 'features']
      },
      {
        id: '2',
        productId: productId,
        title: 'Product Demo Video',
        description: 'Live demonstration of product functionality',
        filename: 'product_demo.mp4',
        url: '/uploads/videos/product_demo.mp4',
        thumbnail: '/uploads/videos/thumbnails/product_demo.jpg',
        duration: 180,
        size: 50000000,
        quality: '1080p',
        format: 'mp4',
        type: 'demo',
        category: 'product',
        uploadDate: new Date('2024-01-20').toISOString(),
        views: 567,
        likes: 45,
        shares: 8,
        tags: ['demo', 'functionality', 'live']
      },
      {
        id: '3',
        productId: productId,
        title: 'Installation Guide Video',
        description: 'Step-by-step installation instructions',
        filename: 'installation_guide.mp4',
        url: '/uploads/videos/installation_guide.mp4',
        thumbnail: '/uploads/videos/thumbnails/installation_guide.jpg',
        duration: 90,
        size: 25000000,
        quality: '720p',
        format: 'mp4',
        type: 'tutorial',
        category: 'installation',
        uploadDate: new Date('2024-01-25').toISOString(),
        views: 423,
        likes: 34,
        shares: 6,
        tags: ['installation', 'guide', 'tutorial']
      },
      {
        id: '4',
        productId: productId,
        title: 'Maintenance Video',
        description: 'Regular maintenance procedures and tips',
        filename: 'maintenance.mp4',
        url: '/uploads/videos/maintenance.mp4',
        thumbnail: '/uploads/videos/thumbnails/maintenance.jpg',
        duration: 150,
        size: 40000000,
        quality: '720p',
        format: 'mp4',
        type: 'tutorial',
        category: 'maintenance',
        uploadDate: new Date('2024-01-30').toISOString(),
        views: 234,
        likes: 18,
        shares: 4,
        tags: ['maintenance', 'procedures', 'tips']
      },
      {
        id: '5',
        productId: productId,
        title: 'Customer Testimonial Video',
        description: 'Customer feedback and testimonials',
        filename: 'testimonial.mp4',
        url: '/uploads/videos/testimonial.mp4',
        thumbnail: '/uploads/videos/thumbnails/testimonial.jpg',
        duration: 60,
        size: 20000000,
        quality: '720p',
        format: 'mp4',
        type: 'testimonial',
        category: 'customer',
        uploadDate: new Date('2024-02-01').toISOString(),
        views: 156,
        likes: 12,
        shares: 3,
        tags: ['testimonial', 'customer', 'feedback']
      },
      {
        id: '6',
        productId: productId,
        title: 'Technical Specifications Video',
        description: 'Detailed technical specifications and data',
        filename: 'tech_specs.mp4',
        url: '/uploads/videos/tech_specs.mp4',
        thumbnail: '/uploads/videos/thumbnails/tech_specs.jpg',
        duration: 75,
        size: 30000000,
        quality: '720p',
        format: 'mp4',
        type: 'technical',
        category: 'specifications',
        uploadDate: new Date('2024-02-05').toISOString(),
        views: 98,
        likes: 8,
        shares: 2,
        tags: ['technical', 'specifications', 'data']
      }
    ];

    // Filter videos by type if specified
    const filteredVideos = type === 'all' 
      ? productVideos 
      : productVideos.filter(video => video.type === type);

    // Apply pagination
    const paginatedVideos = filteredVideos.slice(offset, offset + limit);

    // Calculate statistics
    const totalVideos = filteredVideos.length;
    const totalViews = filteredVideos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = filteredVideos.reduce((sum, video) => sum + video.likes, 0);
    const totalDuration = filteredVideos.reduce((sum, video) => sum + video.duration, 0);

    // Group videos by type
    const videosByType = filteredVideos.reduce((acc, video) => {
      if (!acc[video.type]) {
        acc[video.type] = [];
      }
      acc[video.type].push(video);
      return acc;
    }, {} as Record<string, typeof productVideos>);

    return NextResponse.json({
      success: true,
      message: 'Product videos retrieved successfully',
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
        product: {
          id: productId,
          name: 'Bell24h Product',
          category: 'Manufacturing Equipment',
          videoCount: totalVideos
        },
        videosByType,
        videoTypes: Object.keys(videosByType)
      }
    });

  } catch (error) {
    console.error('Product videos fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product videos' },
      { status: 500 }
    );
  }
} 