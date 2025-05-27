import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(req: Request) {
    const token = await getSession('auth_token')
    const body = await req.json()
    const res = await BackendAxios.post('edit/users', body, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (response) => response.data)
    .catch(e => {
        console.log('error', e)
        return e.response.data
    })
    return Response.json(res)
}