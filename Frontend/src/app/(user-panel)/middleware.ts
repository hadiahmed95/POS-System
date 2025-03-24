import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../lib/session";

export default async function userPanelMiddleware(request: NextRequest) {
    const token = await getSession('auth_token')
    if (!token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    // Continue with the request
    return NextResponse.next();
}