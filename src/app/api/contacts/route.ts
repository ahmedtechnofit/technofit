import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all contacts (for CRM)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      db.contact.count(),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ contacts: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }
}

// POST - Create a new contact (registration/contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const contact = await db.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message: message || null,
        status: 'new',
      },
    });

    return NextResponse.json({
      message: 'Message sent successfully!',
      contact
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// DELETE - Delete a contact
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }
    
    await db.contact.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
