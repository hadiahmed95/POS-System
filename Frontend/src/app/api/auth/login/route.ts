import { createSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    const data = await request.json()
    const res = await BackendAxios.post('login', data)
    .then(async (response) => {
        const _response = response.data
        if(_response.status === "success") {
            await createSession('auth_token', _response.data.token)
        }
        return _response
    })
    .catch(e => {
        return e.response.data
    })
    return Response.json(res)
}