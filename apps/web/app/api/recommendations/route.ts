import { NextRequest, NextResponse } from 'next/server';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${ML_API_URL}/recommendations?user_id=${encodeURIComponent(userId)}&n=10`,
      { 
        next: { revalidate: 300 } // Cache 5 min
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'No recommendations available' },
        { status: 404 }
      );
    }

    const recommendations = await res.json();
    return NextResponse.json(recommendations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}
