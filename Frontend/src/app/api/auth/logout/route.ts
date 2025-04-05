import { deleteSession } from "@/app/lib/session"
import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    await deleteSession('auth_token')
    // const data = await request.json()
    // const res = await BackendAxios.post('login', data)
    // .then(async (response) => {
    //     const _response = response.data
    //     if(_response.status === "success") {
    //         await deleteSession('auth_token')
    //     }
    //     return _response
    // })
    // .catch(e => {
    //     return e.response.data
    // })
    return Response.json({
        status: "success"
    })
}