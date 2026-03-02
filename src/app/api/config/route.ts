import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get site configuration
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    
    if (key) {
      const config = await db.siteConfig.findUnique({ where: { key } });
      return NextResponse.json({ value: config?.value || null });
    }
    
    const configs = await db.siteConfig.findMany();
    const configMap: Record<string, string> = {};
    configs.forEach(c => {
      configMap[c.key] = c.value;
    });
    
    return NextResponse.json(configMap);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST - Update site configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }
    
    const config = await db.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
