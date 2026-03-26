import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await kv.get('safe-dashboard-data');
    return NextResponse.json(data || { isNull: true });
  } catch (error) {
    console.error('KV GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await kv.set('safe-dashboard-data', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
