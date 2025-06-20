import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    const token = await getSession('auth_token')
    const res = await BackendAxios.get(`view/expenses/types`, {
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