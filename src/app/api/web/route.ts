import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Check if uploads directory exists, create if not
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

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

    // Generate unique file name to prevent conflicts
    const uniqueFileName = `${randomUUID()}-${fileName}`;
    const filePath = join(uploadDir, uniqueFileName);
    
    // Convert file to buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Return the path accessible via public directory
    const fileUrl = `/uploads/${uniqueFileName}`;
    
    return NextResponse.json({ link: fileUrl }, { status: 200 });
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