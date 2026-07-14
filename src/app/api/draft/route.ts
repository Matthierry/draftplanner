import {NextResponse} from 'next/server';import {isAuthenticated} from '@/lib/auth/session';import {readDraftState} from '@/lib/google-sheets/repository';
export async function GET(){if(!await isAuthenticated())return NextResponse.json({error:'Unauthenticated'},{status:401});return NextResponse.json(await readDraftState());}
