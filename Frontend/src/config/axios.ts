import axios from 'axios'
import { API_URL } from './constants'

const BackendAxios = axios.create({
    baseURL: `${API_URL}/api`
})

// Add request interceptor to handle FormData
BackendAxios.interceptors.request.use(
    (config) => {
      // If the data is FormData, make sure to remove the Content-Type header
      // to let the browser set the proper boundary value
      if (config.data instanceof FormData) {
        // Remove Content-Type if it's been explicitly set
        if (config.headers && 'Content-Type' in config.headers) {
          delete config.headers['Content-Type'];
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

export default BackendAxios