import {NextResponse} from 'next/server';import {isAuthenticated} from '@/lib/auth/session';import {confirmSale} from '@/lib/google-sheets/repository';
export async function POST(req:Request){if(!await isAuthenticated())return NextResponse.json({error:'Unauthenticated'},{status:401});const result=await confirmSale(await req.json());return NextResponse.json(result,{status:result.ok?200:400});}
