import { createClient } from '@vercel/kv';
import { NextResponse } from 'next/server';

const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  try {
    if (!kv) {
      console.warn('KV Database not connected.');
      return NextResponse.json({ isNull: true, hrPool: null, sites: null, siteDirectoryPdf: null, dbMissing: true });
    }

    const data = await kv.get('safe-dashboard-data') || { hrPool: null, sites: null };

    // Fetch Site Directory PDF chunks
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

    // Fetch Safety Standards PDF chunks
    const safetyChunkCount = await kv.get('safe-pdf-safety-count');
    let safetyStandardsPdf = null;
    if (safetyChunkCount) {
      let fullPdf = '';
      for (let i = 0; i < safetyChunkCount; i++) {
        const chunk = await kv.get(`safe-pdf-safety-${i}`);
        if (chunk) fullPdf += chunk;
      }
      safetyStandardsPdf = fullPdf;
    }

    return NextResponse.json({ ...data, siteDirectoryPdf, safetyStandardsPdf });
  } catch (error) {
    console.error('KV GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!kv) {
      throw new Error("[DB_MISSING] Vercel 관리자 화면에서 데이터베이스(Upstash Redis)가 프로젝트에 정상적으로 연결(Connect)되지 않았습니다.");
    }

    const body = await request.json();
    
    if (body.type === 'data') {
      // 1. 일반 텍스트 데이터 (인력/현장) 초경량화 동기화
      await kv.set('safe-dashboard-data', { hrPool: body.hrPool, sites: body.sites });
    } else if (body.type === 'pdf') {
      // 2. 대용량 PDF 데이터 독립 동기화 (분할 저장)
      if (body.siteDirectoryPdf) {
        const chunks = body.siteDirectoryPdf.match(/.{1,800000}/g); 
        if (chunks) {
          await kv.set('safe-pdf-count', chunks.length);
          for (let i = 0; i < chunks.length; i++) {
            await kv.set(`safe-pdf-${i}`, chunks[i]);
          }
        }
      } else {
        await kv.set('safe-pdf-count', 0);
      }
    } else if (body.type === 'pdf_safety') {
      // 3. 안전관리자 배치기준 PDF 독립 동기화
      if (body.safetyStandardsPdf) {
        const chunks = body.safetyStandardsPdf.match(/.{1,800000}/g); 
        if (chunks) {
          await kv.set('safe-pdf-safety-count', chunks.length);
          for (let i = 0; i < chunks.length; i++) {
            await kv.set(`safe-pdf-safety-${i}`, chunks[i]);
          }
        }
      } else {
        await kv.set('safe-pdf-safety-count', 0);
      }
    } else {
      // 하위 호환성
      await kv.set('safe-dashboard-data', { hrPool: body.hrPool, sites: body.sites });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV POST Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
