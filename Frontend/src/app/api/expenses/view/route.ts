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
    
    if (body.status) {
        queryParams.append('status', body.status);
    }
    
    if (body.expense_type_id) {
        queryParams.append('expense_type_id', body.expense_type_id);
    }
    
    if (body.payment_method) {
        queryParams.append('payment_method', body.payment_method);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const res = await BackendAxios.get(`view/expenses${queryString}`, {
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