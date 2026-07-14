import {redirect} from 'next/navigation';import {isAuthenticated} from '@/lib/auth/session';import DraftClient from '@/components/draft/DraftClient';
export default async function DraftPage(){if(!await isAuthenticated())redirect('/login');return <DraftClient/>}
