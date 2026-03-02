import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get a single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const incrementView = searchParams.get('incrementView') === 'true';
    
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        likesRelation: {
          select: { ipAddress: true },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Increment view count if requested
    if (incrementView) {
      await db.post.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    }
    
    // Parse tags
    const postWithParsedTags = {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
    };
    
    return NextResponse.json(postWithParsedTags);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, content, excerpt, imageUrl, imageAlt, category, tags, published, metaTitle, metaDescription, keywords } = body;
    
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageAlt !== undefined) updateData.imageAlt = imageAlt;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (published !== undefined) updateData.published = published;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (keywords !== undefined) updateData.keywords = keywords;
    
    const post = await db.post.update({
      where: { slug },
      data: updateData,
    });
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    await db.post.delete({ where: { slug } });
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
