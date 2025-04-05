import axios from 'axios'
import { API_URL } from './constants'

const BackendAxios = axios.create({
    baseURL: `${API_URL}/api`
})

export default BackendAxios