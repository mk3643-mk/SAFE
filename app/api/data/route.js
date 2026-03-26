import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  try {
    const data = await kv.get('safe-dashboard-data') || { hrPool: null, sites: null };

    // Fetch PDF chunks
    const chunkCount = await kv.get('safe-pdf-count');
    let siteDirectoryPdf = null;
    if (chunkCount) {
      let fullPdf = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await kv.get(`safe-pdf-${i}`);
        if (chunk) fullPdf += chunk;
      }
      siteDirectoryPdf = fullPdf;
    }

    return NextResponse.json({ ...data, siteDirectoryPdf });
  } catch (error) {
    console.error('KV GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { hrPool, sites, siteDirectoryPdf } = body;

    // Save standard arrays (since images are now <50kb, this easily fits in 1MB limit)
    await kv.set('safe-dashboard-data', { hrPool, sites });

    // Save PDF using Chunking (since PDFs can be >1MB, bypass limit via splitting)
    if (siteDirectoryPdf) {
      const chunks = siteDirectoryPdf.match(/.{1,800000}/g); // 800,000 chars per chunk
      if (chunks) {
        await kv.set('safe-pdf-count', chunks.length);
        for (let i = 0; i < chunks.length; i++) {
          await kv.set(`safe-pdf-${i}`, chunks[i]);
        }
      }
    } else if (siteDirectoryPdf === null) {
      await kv.set('safe-pdf-count', 0);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV POST Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
