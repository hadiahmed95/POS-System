import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(req: Request) {
    const token = await getSession('auth_token')
    const body = await req.json()
    try {
        const res = await BackendAxios.post('add/items', body, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(async (response) => response.data)
        .catch(e => {
            console.log('error', e)
            return Response.json(e.response)
        })
        return Response.json(res)
    } catch(e: any) {
        return Response.json({
            status: e.status,
            message: e.message
        })
    }
}