import {NextResponse} from 'next/server';import {createSession} from '@/lib/auth/session';
export async function POST(req:Request){const form=await req.formData();if(form.get('pin')!==process.env.DRAFT_APP_PIN)return NextResponse.redirect(new URL('/login?error=1',req.url));await createSession();return NextResponse.redirect(new URL('/draft',req.url));}
