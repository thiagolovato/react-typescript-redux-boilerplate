import axios from 'axios';

export const post = async <T>(path: string, data: object | string) => {
  try {
    const response = await axios.post<T>(path, data);
    console.log(response);
    return response.data;
  } catch (error) {
    // todo
    return {} as T;
  }
};
