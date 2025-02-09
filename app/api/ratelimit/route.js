import { messageRateLimiter } from '@/lib/ratelimit';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const user = await currentUser();
    const identifier = user?.id || 'anonymous';
    
    const { success } = await messageRateLimiter.limit(identifier);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.json({ success: false, error: 'Rate limit check failed' });
  }
} 