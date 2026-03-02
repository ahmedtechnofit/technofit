import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all posts with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    
    const skip = (page - 1) * limit;
    
    const where: { published?: boolean; category?: string } = {};
    if (published === 'true') where.published = true;
    if (published === 'false') where.published = false;
    if (category) where.category = category;
    
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          category: true,
          tags: true,
          published: true,
          likes: true,
          views: true,
          createdAt: true,
        },
      }),
      db.post.count({ where }),
    ]);
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, imageUrl, imageAlt, category, tags, published, metaTitle, metaDescription, keywords } = body;
    
    if (!title || !slug || !content || !excerpt || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if slug already exists
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (existingPost) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        imageUrl,
        imageAlt,
        category,
        tags: tags ? JSON.stringify(tags) : '[]',
        published: published || false,
        metaTitle,
        metaDescription,
        keywords,
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
