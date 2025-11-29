import { getRequest } from '../../../api/baseApi';
import { Product } from '../models/Product';

export const ProductRepository = {
    async getAll(): Promise<Product[]> {
        return await getRequest('/products');
    },

    async getById(id: number): Promise<Product> {
        return await getRequest(`/products/${id}`);
    },
};
