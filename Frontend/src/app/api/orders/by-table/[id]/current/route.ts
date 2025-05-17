import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const token = await getSession('auth_token')
    const id = params.id
    
    // Fetch only active orders for this table
    const res = await BackendAxios.get(`view/orders/table/${id}?active_only=true`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (response) => {
        // Return the first (most recent) active order if it exists
        if (response.data.status === 'success' && 
            response.data.data && 
            response.data.data.data && 
            response.data.data.data.length > 0) {
            return {
                ...response.data,
                data: response.data.data.data[0]
            };
        }
        return response.data;
    })
    .catch(e => {
        return e.response.data
    })
    return Response.json(res)
}