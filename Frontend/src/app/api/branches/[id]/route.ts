import { getSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

    const token = await getSession('auth_token')
    const { id } = await params
    const res = await BackendAxios.post('record/branches', {id}, {
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