import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

const MAX_RAW = 2000;

function basicPolish(input: string): string {
  let s = input.trim();
  if (!s) return '';
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) s += '.';
  return s;
}

export async function POST(request: NextRequest) {
  try {
    const rl = await enforceRateLimit(request, 'api:inspections:polish-voice', {
      windowSeconds: 60,
      limit: 40,
      scope: 'ip+user',
    });
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const raw = typeof body.raw === 'string' ? body.raw.slice(0, MAX_RAW).trim() : '';
    if (!raw) {
      return NextResponse.json({ polished: '' });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ polished: basicPolish(raw) });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VOICE_POLISH_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You turn short spoken vehicle pre-delivery inspection phrases into clear, professional one-sentence notes for a written report. Output only the note text, no quotes or preamble. Use Australian English spelling where natural.',
          },
          { role: 'user', content: raw },
        ],
        max_tokens: 150,
        temperature: 0.25,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ polished: basicPolish(raw) });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (!text) {
      return NextResponse.json({ polished: basicPolish(raw) });
    }

    return NextResponse.json({ polished: text });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
