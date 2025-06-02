import BackendAxios from "@/config/axios"

export async function POST(request: Request) {

    const { token } = await request.json()
    const res = await BackendAxios.post('view/users/get-user-by-token', { token }, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(async (response) => ({
        ...response.data,
        statusCode: response.status
    }))
    .catch(e => {
        return {
            ...e.response.data,
            statusCode: e.status
        }
    })
    return Response.json(res)
}