import BackendAxios from "@/config/axios"

export async function POST(request: Request) {
    const { token, id } = await request.json()
    const res = await BackendAxios.get('user-permissions?user_id='+id, {
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