import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Clean up old data (older than 3 months)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body; // 'posts', 'contacts', 'comments', 'images', or 'all'
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const results = {
      postsDeleted: 0,
      contactsDeleted: 0,
      commentsDeleted: 0,
      imagesDeleted: 0,
    };
    
    if (type === 'posts' || type === 'all') {
      // Delete posts older than 3 months (only unpublished ones to protect content)
      const deletedPosts = await db.post.deleteMany({
        where: {
          createdAt: { lt: threeMonthsAgo },
          published: false,
        },
      });
      results.postsDeleted = deletedPosts.count;
    }
    
    if (type === 'contacts' || type === 'all') {
      // Delete contacts older than 3 months
      const deletedContacts = await db.contact.deleteMany({
        where: {
          createdAt: { lt: threeMonthsAgo },
        },
      });
      results.contactsDeleted = deletedContacts.count;
    }
    
    if ((type === 'comments' || type === 'all') && db.comment) {
      // Delete old unapproved comments
      const deletedComments = await db.comment.deleteMany({
        where: {
          createdAt: { lt: threeMonthsAgo },
          approved: false,
        },
      });
      results.commentsDeleted = deletedComments.count;
    }
    
    if (type === 'images' || type === 'all') {
      // Delete unused images older than 3 months
      const posts = await db.post.findMany({
        select: { imageUrl: true },
      });
      const usedUrls = new Set(posts.map(p => p.imageUrl).filter(Boolean));
      
      const unusedImages = await db.uploadedImage.findMany({
        where: {
          createdAt: { lt: threeMonthsAgo },
        },
      });
      
      for (const image of unusedImages) {
        if (!usedUrls.has(image.url)) {
          await db.uploadedImage.delete({ where: { id: image.id } });
          results.imagesDeleted++;
        }
      }
    }
    
    // Get database stats after cleanup
    const stats = {
      totalPosts: await db.post.count(),
      totalContacts: await db.contact.count(),
      totalImages: await db.uploadedImage.count(),
      totalLikes: await db.like.count(),
      totalComments: db.comment ? await db.comment.count() : 0,
    };
    
    return NextResponse.json({
      message: 'Cleanup completed successfully',
      results,
      stats,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({ error: 'Failed to perform cleanup' }, { status: 500 });
  }
}

// GET - Get database stats
export async function GET() {
  try {
    const stats = {
      posts: {
        total: await db.post.count(),
        published: await db.post.count({ where: { published: true } }),
        unpublished: await db.post.count({ where: { published: false } }),
      },
      contacts: await db.contact.count(),
      images: await db.uploadedImage.count(),
      likes: await db.like.count(),
      comments: db.comment ? {
        total: await db.comment.count(),
        pending: await db.comment.count({ where: { approved: false } }),
        approved: await db.comment.count({ where: { approved: true } }),
      } : { total: 0, pending: 0, approved: 0 },
    };
    
    // Get oldest records dates
    const oldestPost = await db.post.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    
    const oldestContact = await db.contact.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    
    return NextResponse.json({
      stats,
      oldestRecords: {
        post: oldestPost?.createdAt,
        contact: oldestContact?.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
