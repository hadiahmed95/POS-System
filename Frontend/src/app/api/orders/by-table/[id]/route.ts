import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const token = await getSession('auth_token')
    const id = params.id
    
    // Construct the URL with the 'active_only' parameter if needed
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('active_only') === 'true';
    const queryParams = activeOnly ? '?active_only=true' : '';
    
    const res = await BackendAxios.get(`view/orders/table/${id}${queryParams}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (response) => response.data)
    .catch(e => {
        return e.response.data
    })
    return Response.json(res)
}