/**
 * Product.d.ts
 * Defines data type for Product object
 */

// Data type describing Product used in the app
export interface Product {
    id: number;
    // canonical fields used in parts of the app
    name?: string;
    img?: string | null;
    // legacy/alternate fields that some components still use
    title?: string;
    image?: string;
    price: number;
    description?: string;
    categoryId?: number;
}
