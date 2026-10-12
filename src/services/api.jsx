import axios from 'axios';
import {BACKEND_API_URL} from '@env';

console.log('BACKEND_API_URL =', BACKEND_API_URL);

const Api = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
});

export default Api;