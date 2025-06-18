import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const token = await getSession('auth_token')
    const id = params.id
    
    const res = await BackendAxios.get(`view/expense-types/${id}`, {
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