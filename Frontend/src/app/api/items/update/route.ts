import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    const token = await getSession('auth_token')
    const endpoint = 'edit/items';
    try {
        // Check if the request is multipart/form-data
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            // Handle FormData submission
            const formData = await req.formData();
            
            // Pass the FormData directly to axios
            const res = await BackendAxios.post(endpoint, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // Don't set Content-Type here, axios will set it with the correct boundary
                }
            })
            .then(async (response) => response.data)
            .catch(e => {
                console.log('FormData error:', e);
                return Response.json({
                    status: e.response?.status || 500,
                    message: e.response?.data?.message || e.message
                }, { status: e.response?.status || 500 });
            });
            
            return Response.json(res);
        } else {
            // Handle JSON submission as fallback
            const body = await req.json();
            console.log('JSON body:', body);
            
            const res = await BackendAxios.post(endpoint, body, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(async (response) => response.data)
            .catch(e => {
                console.log('JSON error:', e);
                return Response.json({
                    status: e.response?.status || 500,
                    message: e.response?.data?.message || e.message
                }, { status: e.response?.status || 500 });
            });
            
            return Response.json(res);
        }
    } catch(e: any) {
        console.error('Unhandled error:', e);
        return Response.json({
            status: e.status || 500,
            message: e.message || 'An unexpected error occurred'
        }, { status: e.status || 500 });
    }
}