import { toast } from "react-toastify"

const toastCustom = {
    success : (message: string) => toast.success(message, { hideProgressBar: true }),
    info : (message: string) => toast.info(message, { hideProgressBar: true }),
    error : (message: string) => toast.error(message, { hideProgressBar: true })
}

export {
    toastCustom
}