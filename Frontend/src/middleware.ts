import { NextRequest, NextResponse } from 'next/server';
import userPanelMiddleware from './app/(user-panel)/middleware';

// Middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRequired = pathname.startsWith('/dashboard') || pathname.startsWith('/post') || pathname.startsWith('/user')

  if(isAuthRequired) {
    return userPanelMiddleware(request)
  }

  // if(pathname.startsWith('/auth')) {
  //   return AuthMiddleware(request)
  // }

  // Continue with the request
  return NextResponse.next();
}