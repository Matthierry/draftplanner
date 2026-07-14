import {cookies} from 'next/headers';import {SignJWT,jwtVerify} from 'jose';
const name='draft_session'; const key=()=>new TextEncoder().encode(process.env.SESSION_SECRET||'dev-secret-dev-secret-dev-secret-32');
export async function createSession(){const token=await new SignJWT({ok:true}).setProtectedHeader({alg:'HS256'}).setExpirationTime('12h').sign(key());(await cookies()).set(name,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/'});}
export async function clearSession(){(await cookies()).delete(name);} 
export async function isAuthenticated(){const token=(await cookies()).get(name)?.value;if(!token)return false;try{await jwtVerify(token,key());return true;}catch{return false;}}
export async function requireAuth(){if(!(await isAuthenticated())) throw new Error('Unauthenticated');}
