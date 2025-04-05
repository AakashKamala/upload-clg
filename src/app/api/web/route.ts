import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded.' },
        { status: 400 }
      );
    }

    // Check file extension
    const fileName = file.name;
    if (!fileName.toLowerCase().endsWith('.html')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only HTML files are accepted.' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const uniqueFileName = `${randomUUID()}-${fileName}`;
    
    // Convert file to arrayBuffer and upload to Vercel Blob Storage
    const buffer = await file.arrayBuffer();
    
    // Use Vercel Blob for file storage instead of the filesystem
    const blob = await put(uniqueFileName, buffer, {
      contentType: 'text/html',
      access: 'public',
    });
    
    // Return the URL from Vercel Blob
    return NextResponse.json({ link: blob.url }, { status: 200 });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};