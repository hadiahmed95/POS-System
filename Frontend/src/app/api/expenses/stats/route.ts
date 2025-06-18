import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    const token = await getSession('auth_token')
    const body = await request.json()
    
    // Add any filters from request body
    const queryParams = new URLSearchParams();
    
    if (body.date_from && body.date_to) {
        queryParams.append('date_from', body.date_from);
        queryParams.append('date_to', body.date_to);
    }
    
    if (body.branch_id) {
        queryParams.append('branch_id', body.branch_id);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const res = await BackendAxios.get(`view/expenses/stats${queryString}`, {
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
