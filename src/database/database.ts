import * as SQLite from 'expo-sqlite';
import { Product as ProductModel } from '../features/Products/models/Product'; // Assume Product model is imported correctly
import { removeVietnameseTones } from '../utils/helper';

// ===============================================
// 1. INTERFACES (Kept original and optimized)
// ===============================================
export interface Product extends ProductModel {
    id: number;
    name: string;
    price: number;
    img: string | null;
    categoryId: number;
}

export interface Category {
    id: number;
    name: string;
    iconUri?: string;
}

export interface User {
    id: number;
    username: string;
    password?: string;
    isAdmin: boolean;
    phone?: string;
    createdAt: string;
}

export interface Order {
    id: number;
    userId: number;
    total: number;
    status: string;
    address: string;
    phone?: string;
    createdAt: string;
}

// OrderWithPhone remains unchanged as Order already has phone
export interface OrderWithPhone extends Order { }

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
}


// ===============================================
// 2. INITIAL DATA & DATABASE INSTANCE
// ===============================================
let db: any = null;

const getDatabase = () => {
                if (!db) {
                    db = SQLite.openDatabaseSync('products.db');
                }
                return db;
};

const initialCategories: Category[] = [
    { id: 1, name: 'Quần', iconUri: 'https://i.pinimg.com/1200x/fb/5d/ff/fb5dff754e24426ab01d6c67b867d8d8.jpg' },
    { id: 2, name: 'Áo', iconUri: 'https://i.pinimg.com/736x/a9/39/8c/a9398c8e769db16033ed6ecb6c14beb6.jpg' },
    { id: 3, name: 'Túi', iconUri: 'https://i.pinimg.com/1200x/c1/30/fe/c130fe8fb2bf5383b2c954c182f51394.jpg' },
    { id: 4, name: 'Giày', iconUri: 'https://i.pinimg.com/1200x/d1/ba/72/d1ba72a0ce51af0ede6c2f1986e27259.jpg' },
    { id: 5, name: 'Váy', iconUri: 'https://i.pinimg.com/1200x/1b/43/0c/1b430c71d788678e2a844a9da02997b3.jpg' },
    { id: 6, name: 'Phụ kiện', iconUri: 'https://i.pinimg.com/1200x/09/60/e6/0960e6709dd0bf6647309dfa7cb7a801.jpg' },
    { id: 7, name: 'Áo khoác', iconUri: 'https://i.pinimg.com/1200x/70/91/87/709187b8dbaac4b82875d4a8cf466bf1.jpg' },
];

const initialProducts: Product[] = [
    // Quần (Category 1)
    { id: 1, name: 'Quần Jeans Nữ Ống Rộng', price: 550000, img: 'https://i.pinimg.com/1200x/98/63/17/9863175f61ca18c5d3774f187765c464.jpg', categoryId: 1 },
    { id: 2, name: 'Quần Kaki Nữ Công Sở', price: 450000, img: 'https://i.pinimg.com/1200x/62/57/10/6257108906dfbd8d14267ba0a9e23a20.jpg', categoryId: 1 },
    { id: 3, name: 'Quần Legging Nữ', price: 380000, img: 'https://i.pinimg.com/736x/53/eb/b2/53ebb27097a7c26e82bc902d708aae5d.jpg', categoryId: 1 },
    { id: 4, name: 'Quần Short Nữ Thể Thao', price: 320000, img: 'https://i.pinimg.com/736x/59/93/70/5993703042e6cf5703be40f3b7a18442.jpg', categoryId: 1 },
    { id: 5, name: 'Quần Ống Loe Nữ', price: 480000, img: 'https://i.pinimg.com/736x/a0/4d/55/a04d55b24505e9995bc013085f6a4c70.jpg', categoryId: 1 },
    
    // Áo (Category 2) - Feminine styles
    { id: 6, name: 'Áo Thun Nữ Cổ Tròn', price: 350000, img: 'https://i.pinimg.com/736x/d6/6e/35/d66e354f578423c1e1046f7ebbb3234c.jpg', categoryId: 2 },
    { id: 7, name: 'Áo Sơ Mi Nữ Công Sở', price: 400000, img: 'https://i.pinimg.com/1200x/8c/86/aa/8c86aac01dbca4b8886cae3d73544e72.jpg', categoryId: 2 },
    { id: 8, name: 'Áo Kiểu Nữ Tay Ngắn', price: 420000, img: 'https://i.pinimg.com/736x/26/29/8f/26298f9cb340a08a25f48ec3f39a192e.jpg', categoryId: 2 },
    { id: 9, name: 'Áo Ba Lỗ Nữ', price: 280000, img: 'https://i.pinimg.com/1200x/1b/4e/cd/1b4ecdb301c20cd0efc0c1564d59ea39.jpg', categoryId: 2 },
    { id: 10, name: 'Áo Len Nữ Cổ Lọ', price: 520000, img: 'https://i.pinimg.com/1200x/31/ce/ee/31ceee5f41f5d54b90401fc4a03b486c.jpg', categoryId: 2 },
    
    // Túi (Category 3)
    { id: 11, name: 'Túi Xách Da Nữ', price: 1200000, img: 'https://i.pinimg.com/1200x/1e/16/ca/1e16caf94272c10927371ab8d5256dbc.jpg', categoryId: 3 },
    { id: 12, name: 'Túi Đeo Chéo Nữ', price: 800000, img: 'https://i.pinimg.com/1200x/35/1c/a4/351ca40b7e07e1c401b713de1502ebb6.jpg', categoryId: 3 },
    { id: 13, name: 'Túi Tote Nữ', price: 650000, img: 'https://img.fantaskycdn.com/fd9fcbc5f87b2baaa1f465010916b7e4_750x.jpeg', categoryId: 3 },
    { id: 14, name: 'Túi Mini Nữ', price: 450000, img: 'https://i.pinimg.com/1200x/d5/21/38/d52138fd647f86f7d6baa9b6c8b90309.jpg', categoryId: 3 },
    { id: 15, name: 'Túi Backpack Nữ', price: 750000, img: 'https://i.pinimg.com/736x/77/aa/7f/77aa7f72528d52330df9395cc7ab1e50.jpg', categoryId: 3 },
    
    // Giày (Category 4) - Mostly high heels
    { id: 16, name: 'Giày Cao Gót Đen', price: 900000, img: 'https://i.pinimg.com/736x/55/4a/69/554a697b8c2410871d6a4cf0ef0439de.jpg', categoryId: 4 },
    { id: 17, name: 'Giày Cao Gót Đỏ', price: 950000, img: 'https://i.pinimg.com/1200x/3a/8b/b0/3a8bb0c70a9be5cb548d8e31d13520b8.jpg', categoryId: 4 },
    { id: 18, name: 'Giày Cao Gót Nude', price: 880000, img: 'https://i.pinimg.com/1200x/96/53/ac/9653ac63614d2dd4cba39e9fa9b2d52a.jpg', categoryId: 4 },
    { id: 19, name: 'Giày Cao Gót Stiletto', price: 1200000, img: 'https://i.pinimg.com/1200x/5c/a0/d2/5ca0d27e9f4f5c2d5ac1c26a586da524.jpg', categoryId: 4 },
    { id: 20, name: 'Giày Cao Gót Mũi Nhọn', price: 1100000, img: 'https://i.pinimg.com/1200x/9b/ac/2c/9bac2ce102af40023ba93236f17b414f.jpg', categoryId: 4 },
    
    // Váy (Category 5)
    { id: 21, name: 'Váy Liền Thân', price: 650000, img: 'https://i.pinimg.com/736x/c0/42/57/c042579761130fe34c3b3ac70f7ac9b7.jpg', categoryId: 5 },
    { id: 22, name: 'Váy Xòe Nữ', price: 720000, img: 'https://i.pinimg.com/1200x/c9/98/62/c998626a103f5cf18dc78d5939a65ebf.jpg', categoryId: 5 },
    { id: 23, name: 'Váy Ôm Body Nữ', price: 580000, img: 'https://i.pinimg.com/1200x/a1/1b/a6/a11ba6eddb18de331953d3b32b7008d9.jpg', categoryId: 5 },
    { id: 24, name: 'Váy Dài Nữ', price: 850000, img: 'https://i.pinimg.com/1200x/53/28/77/532877d0cd3173d24d7c82f3d346e7f0.jpg', categoryId: 5 },
    { id: 25, name: 'Váy Ngắn Nữ', price: 480000, img: 'https://i.pinimg.com/1200x/2a/18/8e/2a188eef0cfba5444b5767cf6c796adc.jpg', categoryId: 5 },
    
    // Phụ kiện (Category 6)
    { id: 26, name: 'Vòng Tay Nữ', price: 250000, img: 'https://i.pinimg.com/736x/01/63/4d/01634dceea9ab624e93fcb24b430ba14.jpg', categoryId: 6 },
    { id: 27, name: 'Dây Chuyền Nữ', price: 380000, img: 'https://i.pinimg.com/1200x/40/62/33/406233cc0c8223d6944365be8ddeedf9.jpg', categoryId: 6 },
    { id: 28, name: 'Bông Tai Nữ', price: 320000, img: 'https://i.pinimg.com/1200x/0a/18/20/0a18205ead9485f387fae0627273bccb.jpg', categoryId: 6 },
    { id: 29, name: 'Kính Mát Nữ', price: 450000, img: 'https://i.pinimg.com/736x/fd/dc/9f/fddc9fadf9dba93c5a66b4960d655195.jpg', categoryId: 6 },
    { id: 30, name: 'Thắt Lưng Nữ', price: 280000, img: 'https://i.pinimg.com/1200x/66/30/a2/6630a249179e74c5f8bb3bd4b5c2cd25.jpg', categoryId: 6 },
    
    // Áo khoác (Category 7)
    { id: 31, name: 'Áo Khoác Kaki Nữ', price: 680000, img: 'https://i.pinimg.com/1200x/9a/fd/b3/9afdb3ad8013ab1f3dffd7486ea5b652.jpg', categoryId: 7 },
    { id: 32, name: 'Áo Khoác Dù Nữ', price: 550000, img: 'https://i.pinimg.com/736x/b0/76/d9/b076d9c42fdef09ff5dca008bc3ef54a.jpg', categoryId: 7 },
    { id: 33, name: 'Áo Khoác Len Nữ', price: 750000, img: 'https://i.pinimg.com/736x/1d/6b/76/1d6b7648beb22b2f8975d2189f99084a.jpg', categoryId: 7 },
    { id: 34, name: 'Áo Khoác Bomber Nữ', price: 620000, img: 'https://i.pinimg.com/736x/92/50/86/925086c36721ddfa6c623567d39b8501.jpg', categoryId: 7 },
    { id: 35, name: 'Áo Khoác Blazer Nữ', price: 850000, img: 'https://i.pinimg.com/736x/f4/c9/2a/f4c92a5e07bf026420223b55c8961a68.jpg', categoryId: 7 },
];


// ===============================================
// 3. DATABASE INITIALIZATION (Fixed syntax errors)
// ===============================================
export const initializeDatabase = async (callback: () => void) => {
    try {
        const db = getDatabase();
        // 1. CREATE TABLES IF NOT EXISTS
        await db.execAsync(`
            PRAGMA foreign_keys = ON;
            
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                isAdmin INTEGER NOT NULL,
                phone TEXT, 
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                iconUri TEXT
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                img TEXT,
                categoryId INTEGER NOT NULL,
                FOREIGN KEY(categoryId) REFERENCES categories(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY NOT NULL,
                userId INTEGER NOT NULL,
                total REAL NOT NULL,
                status TEXT NOT NULL,
                address TEXT NOT NULL,
                phone TEXT, 
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY NOT NULL,
                orderId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        // 2. UPDATE TABLE STRUCTURE (ONLY ADD PHONE COLUMN IF MISSING)

        // Check and add 'phone' column to orders table
        const ordersTableInfo = await db.getAllAsync('PRAGMA table_info(orders);');
        const ordersColumns = ordersTableInfo.map((row: any) => row.name);
        if (!ordersColumns.includes('phone')) {
            await db.execAsync(`
              ALTER TABLE orders ADD COLUMN phone TEXT;
            `);
        }

        // Check and add 'phone' column to users table
        const usersTableInfo = await db.getAllAsync('PRAGMA table_info(users);');
        const usersColumns = usersTableInfo.map((row: any) => row.name);
        if (!usersColumns.includes('phone')) {
            await db.execAsync(`
              ALTER TABLE users ADD COLUMN phone TEXT;
            `);
        }

        // Check and add 'createdAt' column to users table
        if (!usersColumns.includes('createdAt')) {
            await db.execAsync(`
              ALTER TABLE users ADD COLUMN createdAt DATETIME;
            `);
            // Update old rows with current timestamp
            await db.execAsync(`
              UPDATE users SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL;
            `);
        }

        // 3. SEED INITIAL DATA (IF TABLES ARE EMPTY)
        const productsCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM products;');
        const categoriesCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM categories;');
        
        if (productsCount && productsCount.count === 0) {
            console.log('Inserting initial categories and products...');

            // Insert Categories
            for (const cat of initialCategories) {
                await db.runAsync('INSERT INTO categories (id, name, iconUri) VALUES (?, ?, ?);', [cat.id, cat.name, cat.iconUri ?? null]);
            }

            // Insert Products
            for (const prod of initialProducts) {
                await db.runAsync('INSERT INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?);', [prod.id, prod.name, prod.price, prod.img, prod.categoryId]);
            }

            // Add default admin user if not exists
            await db.runAsync(
                'INSERT INTO users (username, password, isAdmin, phone) VALUES (?, ?, ?, ?);',
                ['admin', 'admin123', 1, '0901234567'] // Warning: DO NOT use clear text passwords in production
            );
        } else {
            // If database already has data, only add new categories if they don't exist
            // Also update iconUri for existing categories to ensure they have the latest images
            console.log('Checking for new categories to add and updating existing ones...');
            for (const cat of initialCategories) {
                const existing = await db.getAllAsync('SELECT id FROM categories WHERE id = ?;', [cat.id]);
                if (existing.length === 0) {
                    try {
                        await db.runAsync('INSERT INTO categories (id, name, iconUri) VALUES (?, ?, ?);', [cat.id, cat.name, cat.iconUri ?? null]);
                        console.log(`Added new category: ${cat.name}`);
                    } catch (error) {
                        console.log(`Category ${cat.name} might already exist or ID conflict`);
                    }
                } else {
                    // Update iconUri for existing categories
                    try {
                        await db.runAsync('UPDATE categories SET iconUri = ? WHERE id = ?;', [cat.iconUri ?? null, cat.id]);
                        console.log(`Updated iconUri for category: ${cat.name}`);
                    } catch (error) {
                        console.log(`Error updating category ${cat.name}:`, error);
                    }
                }
            }
            
            // Add new products if they don't exist, also update images for existing products
            for (const prod of initialProducts) {
                const existing = await db.getAllAsync('SELECT id FROM products WHERE id = ?;', [prod.id]);
                if (existing.length === 0) {
                    try {
                        await db.runAsync('INSERT INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?);', [prod.id, prod.name, prod.price, prod.img, prod.categoryId]);
                        console.log(`Added new product: ${prod.name}`);
                    } catch (error) {
                        console.log(`Product ${prod.name} might already exist or ID conflict`);
                    }
                } else {
                    // Update image for existing products to ensure they have the latest images
                    try {
                        await db.runAsync('UPDATE products SET img = ? WHERE id = ?;', [prod.img, prod.id]);
                        console.log(`Updated image for product: ${prod.name}`);
                    } catch (error) {
                        console.log(`Error updating product ${prod.name}:`, error);
                    }
                }
            }
        }

        // 4. Call callback after completion
        callback();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};


// ===============================================
// 4. DATABASE API FUNCTIONS (Kept original)
// ===============================================

// fetchCategories function kept original
export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync('SELECT * FROM categories;');
        return result;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// fetchProducts function kept original
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync('SELECT * FROM products;');
        return result;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Product CRUD functions kept original
export const addProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync(
            'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?);',
            [product.name, product.price, product.img, product.categoryId]
        );
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const updateProduct = async (product: Product): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync(
            'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ? WHERE id = ?;',
            [product.name, product.price, product.img, product.categoryId, product.id]
        );
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (id: number): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync('DELETE FROM products WHERE id = ?;', [id]);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Search products by name or category (supports accent-insensitive search)
export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
    try {
        const db = getDatabase();
        // Get all products with categories
        const allProducts = await db.getAllAsync(
            `SELECT p.*, c.name as categoryName FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id;`
        );
        
        // Convert keyword to lowercase and remove accents for comparison
        const normalizedKeyword = removeVietnameseTones(keyword.toLowerCase());
        
        // Filter products: search with and without accents
        const filteredProducts = allProducts.filter((product: any) => {
            const productName = product.name || '';
            const categoryName = product.categoryName || '';
            
            // Search with accents (original search)
            const matchWithTones = 
                productName.toLowerCase().includes(keyword.toLowerCase()) ||
                categoryName.toLowerCase().includes(keyword.toLowerCase());
            
            // Search without accents
            const normalizedProductName = removeVietnameseTones(productName);
            const normalizedCategoryName = removeVietnameseTones(categoryName);
            const matchWithoutTones = 
                normalizedProductName.includes(normalizedKeyword) ||
                normalizedCategoryName.includes(normalizedKeyword);
            
            return matchWithTones || matchWithoutTones;
        });
        
        // Remove categoryName field from result (keep only Product fields)
        return filteredProducts.map((product: any) => {
            const { categoryName, ...rest } = product;
            return rest;
        });
    } catch (error) {
        console.error('Error searching products:', error);
        throw error;
    }
};

// Search by price function kept original
export const fetchProductsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync(
            `SELECT * FROM products WHERE price >= ? AND price <= ?;`,
            [minPrice, maxPrice]
        );
        return result;
    } catch (error) {
        console.error('Error fetching products by price range:', error);
        throw error;
    }
};

// Category CRUD functions kept original
export const addCategory = async (category: Omit<Category, 'id'>): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync(
            'INSERT INTO categories (name, iconUri) VALUES (?, ?);',
            [category.name, category.iconUri || null]
        );
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// Update category
export const updateCategory = async (category: Category): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync(
            'UPDATE categories SET name = ?, iconUri = ? WHERE id = ?;',
            [category.name, category.iconUri || null, category.id]
        );
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync('SELECT * FROM products WHERE categoryId = ?;', [categoryId]);
        return result;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
};

// User and Authentication functions kept original
export const addUser = async (user: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<number> => {
    try {
        const db = getDatabase();
        const result = await db.runAsync(
            'INSERT INTO users (username, password, isAdmin, phone) VALUES (?, ?, ?, ?);',
            [user.username, user.password, user.isAdmin ? 1 : 0, user.phone || null]
        );
        return result.lastInsertRowId as number;
    } catch (error) {
        throw error;
    }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
    try {
        const db = getDatabase();
        // Only select necessary columns (password is fetched for comparison)
        const result = await db.getAllAsync('SELECT id, username, password, isAdmin, phone, createdAt FROM users WHERE username = ?;', [username]);
        // Ensure isAdmin is boolean (if in DB it's 0/1)
        return result.length > 0 ? { ...result[0], isAdmin: !!result[0].isAdmin } : null;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

// Update user information (password, phone)
export const updateUser = async (
    id: number,
    fields: { password?: string; phone?: string | null; username?: string; isAdmin?: number }
): Promise<void> => {
    try {
        const db = getDatabase();
        const updates: string[] = [];
        const params: any[] = [];
        if (fields.password !== undefined) {
            updates.push('password = ?');
            params.push(fields.password);
        }
        if (fields.phone !== undefined) {
            updates.push('phone = ?');
            params.push(fields.phone || null);
        }
        if (fields.username !== undefined) {
            updates.push('username = ?');
            params.push(fields.username);
        }
        if (fields.isAdmin !== undefined) {
            updates.push('isAdmin = ?');
            params.push(fields.isAdmin);
        }
        if (updates.length === 0) return;
        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?;`;
        await db.runAsync(sql, params);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Order functions kept original (phone column integrated)
export const createOrder = async (userId: number, items: { productId: number; quantity: number; price: number }[], total: number, address: string, phone?: string): Promise<number> => {
    try {
        const db = getDatabase();
        // Insert order with phone
        const orderResult = await db.runAsync(
            'INSERT INTO orders (userId, total, status, address, phone) VALUES (?, ?, ?, ?, ?);',
            [userId, total, 'pending', address, phone || null]
        );
        const orderId = orderResult.lastInsertRowId as number;

        // Insert order items
        for (const item of items) {
            await db.runAsync(
                'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?);',
                [orderId, item.productId, item.quantity, item.price]
            );
        }

        return orderId;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const fetchOrdersByUser = async (userId: number): Promise<Order[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC;', [userId]);
        return result;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const fetchOrderItems = async (orderId: number): Promise<OrderItem[]> => {
    try {
        const db = getDatabase();
        const result = await db.getAllAsync('SELECT * FROM order_items WHERE orderId = ?;', [orderId]);
        return result;
    } catch (error) {
        console.error('Error fetching order items:', error);
        throw error;
    }
};

export const fetchAllOrders = async (): Promise<OrderWithPhone[]> => {
    try {
        const db = getDatabase();
        // Get all columns from orders table, including the added phone column
        const result = await db.getAllAsync(`
          SELECT *
          FROM orders
          ORDER BY createdAt DESC;
        `);
        return result;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync('UPDATE orders SET status = ? WHERE id = ?;', [status, orderId]);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

// Get all users (exclude admin if needed)
export const fetchAllUsers = async (options?: { excludeAdmin?: boolean }): Promise<User[]> => {
    try {
        const db = getDatabase();
        let sql = 'SELECT id, username, isAdmin, phone, createdAt FROM users';
        let params: any[] = [];
        if (options?.excludeAdmin) {
            sql += ' WHERE isAdmin = 0';
        }
        sql += ' ORDER BY createdAt DESC';
        const result = await db.getAllAsync(sql, params);
        return result.map((u: any) => ({ ...u, isAdmin: !!u.isAdmin }));
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
    try {
        const db = getDatabase();
        await db.runAsync('DELETE FROM users WHERE id = ?;', [id]);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};