import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// GET - List all uploaded images
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    const [images, total] = await Promise.all([
      db.uploadedImage.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.uploadedImage.count(),
    ]);
    
    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

// POST - Upload an image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const alt = formData.get('alt') as string | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Create URL path
    const url = `/uploads/${filename}`;
    
    // Save to database
    const image = await db.uploadedImage.create({
      data: {
        originalName: file.name,
        url,
        size: file.size,
      },
    });
    
    return NextResponse.json({
      message: 'Image uploaded successfully',
      image: {
        ...image,
        alt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// DELETE - Delete an image
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }
    
    const image = await db.uploadedImage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Delete file from filesystem
    const filepath = path.join(process.cwd(), 'public', image.url);
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filepath);
    } catch {
      // File might not exist, continue with database deletion
    }
    
    // Delete from database
    await db.uploadedImage.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
