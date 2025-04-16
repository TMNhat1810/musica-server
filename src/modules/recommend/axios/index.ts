import axios from 'axios';

export const RecommenderSerivce = axios.create({
  baseURL: process.env.RS_URL,
});

RecommenderSerivce.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  },
);
