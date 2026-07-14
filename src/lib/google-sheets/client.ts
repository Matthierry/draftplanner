import 'server-only';import {google} from 'googleapis';import {getEnv} from '@/lib/env';
export async function sheetsClient(){const env=getEnv();const auth=new google.auth.JWT({email:env.GOOGLE_SERVICE_ACCOUNT_EMAIL,key:env.GOOGLE_PRIVATE_KEY,scopes:['https://www.googleapis.com/auth/spreadsheets']});return google.sheets({version:'v4',auth});}
