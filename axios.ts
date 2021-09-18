import axios from 'axios';
import config from 'config';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

const instance = axios.create({
  baseURL: SERVER_API_ENDPOINT,
});

export default instance;
