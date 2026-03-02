import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List comments (for admin)
export async function GET(request: NextRequest) {
  try {
    // Check if db.comment exists
    if (!db.comment) {
      return NextResponse.json({ comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    const approved = searchParams.get('approved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    const where: { postId?: string; approved?: boolean; parentId?: string | null } = {};
    if (postId) where.postId = postId;
    if (approved === 'true') where.approved = true;
    if (approved === 'false') where.approved = false;
    
    // For public view, only show approved comments without replies (root comments)
    if (approved === 'true') {
      where.parentId = null;
    }
    
    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          replies: {
            where: approved === 'true' ? { approved: true } : {},
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      db.comment.count({ where }),
    ]);
    
    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    if (!db.comment) {
      return NextResponse.json({ error: 'Comment system not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { postId, parentId, name, email, content } = body;
    
    if (!postId || !name || !email || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify post exists
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // If it's a reply, verify parent exists
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }
    
    const comment = await db.comment.create({
      data: {
        postId,
        parentId: parentId || null,
        name,
        email,
        content,
        approved: false, // Requires admin approval
      },
    });
    
    return NextResponse.json({ 
      message: 'Comment submitted successfully. It will be reviewed before publishing.',
      comment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// PUT - Approve/Update a comment
export async function PUT(request: NextRequest) {
  try {
    if (!db.comment) {
      return NextResponse.json({ error: 'Comment system not available' }, { status: 500 });
    }
    
    const body = await request.json();
    const { id, approved, content } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const updateData: { approved?: boolean; content?: string } = {};
    if (approved !== undefined) updateData.approved = approved;
    if (content) updateData.content = content;
    
    const comment = await db.comment.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    if (!db.comment) {
      return NextResponse.json({ error: 'Comment system not available' }, { status: 500 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    // Delete replies first
    await db.comment.deleteMany({ where: { parentId: id } });
    
    // Delete the comment
    await db.comment.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
