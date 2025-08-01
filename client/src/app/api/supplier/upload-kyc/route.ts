import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type required' }, { status: 400 });
    }

    // For now, we'll simulate file upload
    // In production, you'd upload to Cloudinary, AWS S3, etc.
    const fileName = `${Date.now()}-${file.name}`;
    const fileUrl = `https://example.com/uploads/${fileName}`;

    // Save document info to database
    const document = await prisma.profile.updateMany({
      where: {
        // You'd need to get the actual user ID from session
        userid: 'temp-user-id'
      },
      data: {
        // Store document URLs in a JSON field or separate table
        certifications: JSON.stringify({
          [documentType]: fileUrl
        })
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      message: 'Document uploaded successfully' 
    });

  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 