import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// GET - Check if user has liked a post
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown';
    
    const existingLike = await db.like.findUnique({
      where: {
        postId_ipAddress: {
          postId,
          ipAddress,
        },
      },
    });
    
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { likes: true },
    });
    
    return NextResponse.json({
      hasLiked: !!existingLike,
      totalLikes: post?.likes || 0,
    });
  } catch (error) {
    console.error('Error checking like:', error);
    return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
  }
}

// POST - Toggle like on a post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId } = body;
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown';
    const userAgent = headersList.get('user-agent') || undefined;
    
    // Check if post exists
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        postId_ipAddress: {
          postId,
          ipAddress,
        },
      },
    });
    
    if (existingLike) {
      // Unlike - remove like and decrement count
      await db.$transaction([
        db.like.delete({
          where: { id: existingLike.id },
        }),
        db.post.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
      
      return NextResponse.json({ liked: false, totalLikes: post.likes - 1 });
    } else {
      // Like - add like and increment count
      await db.$transaction([
        db.like.create({
          data: {
            postId,
            ipAddress,
            userAgent,
          },
        }),
        db.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        }),
      ]);
      
      return NextResponse.json({ liked: true, totalLikes: post.likes + 1 });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
