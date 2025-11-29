import apiClient from './apiClients';

export const getRequest = async (url: string) => {
    const response = await apiClient.get(url);
    return response.data;
};
