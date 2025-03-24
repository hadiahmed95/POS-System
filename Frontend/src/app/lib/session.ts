import 'server-only'
import { cookies } from 'next/headers'

export async function createSession(key: string, value: string) {

  if (!key || !value) {
    return null
  }
  
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
 
  cookieStore.set(key, value, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession(key: string, value: string) {
 
  if (!key || !value) {
    return null
  }
 
  const cookieStore = await cookies()
  cookieStore.set(key, value, {
    httpOnly: true,
    secure: true,
    path: '/',
  })
}

export async function getSession(key: string) {
  const cookieStore = await cookies()
  return cookieStore.get(key)?.value ?? null
}

export async function deleteSession(key: string) {
  const cookieStore = await cookies()
  cookieStore.delete(key)
}