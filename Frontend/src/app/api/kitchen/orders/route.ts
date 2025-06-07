import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function GET(request: Request) {
    const token = await getSession('auth_token')
    
    // Get branch_id from query if provided
    const url = new URL(request.url);
    const branchId = url.searchParams.get('branch_id');
    const queryString = branchId ? `?branch_id=${branchId}` : '';
    
    const res = await BackendAxios.get(`view/kitchen/orders${queryString}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (response) => {
        // Map each order to include kitchen-specific fields
        if (response.data.status === 'success' && 
            response.data.data && 
            response.data.data.data) {
            
            const mappedOrders = response.data.data.data.map((order: any) => {
                // Determine kitchen status based on order status
                return {
                    ...order,
                    kitchen_status: order.status,
                    preparation_time: 15, // Default 15 min prep time
                };
            });
            
            return {
                ...response.data,
                data: {
                    ...response.data.data,
                    data: mappedOrders
                }
            };
        }
        return response.data;
    })
    .catch(e => {
        return e.response.data
    })
    return Response.json(res)
}