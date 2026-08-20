import axios from "axios";

const API_URL = 'http://10.0.2.2:3001/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})