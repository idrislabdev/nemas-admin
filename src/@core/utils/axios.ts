import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 200000
})

const getToken = () => {
    const token = typeof window !== 'undefined'  ? localStorage.getItem("token") : undefined;
    return token;
}

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)
axiosInstance.interceptors.response.use(
    (response) => {
        //modify the response data here
        return response
    },
    (error) => {
        //handle response error
        return Promise.reject(error);
    }
)

export default axiosInstance;