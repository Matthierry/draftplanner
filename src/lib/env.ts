import {z} from 'zod';
const Env=z.object({GOOGLE_SHEETS_SPREADSHEET_ID:z.string().min(1),GOOGLE_SERVICE_ACCOUNT_EMAIL:z.string().email(),GOOGLE_PRIVATE_KEY:z.string().min(1),DRAFT_APP_PIN:z.string().min(1),SESSION_SECRET:z.string().min(32)});
export function getEnv(){const env=Env.parse(process.env);return{...env,GOOGLE_PRIVATE_KEY:env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n')};}
