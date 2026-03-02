import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all services
export async function GET() {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ services: [] });
    }

    const services = await db.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ services: [] });
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { title, description, icon, features, price, order } = body;
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }
    
    const service = await db.service.create({
      data: {
        title,
        description,
        icon: icon || 'Star',
        features: JSON.stringify(features || []),
        price,
        order: order || 0,
      },
    });
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { id, title, description, icon, features, price, order, active } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (features !== undefined) updateData.features = JSON.stringify(features);
    if (price !== undefined) updateData.price = price;
    if (order !== undefined) updateData.order = order;
    if (active !== undefined) updateData.active = active;
    
    const service = await db.service.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    
    await db.service.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
