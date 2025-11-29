/**
 * dbService.ts
 * Provides low-level wrapper functions to interact with SQLiteDatabase (Expo)
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from './database';

// Global variable to store DB connection
let db: any = null;

/**
 * Get initialized DB connection, or initialize if not exists.
 * @returns SQLiteDatabase
 */
export const getDB = async (): Promise<any> => {
    if (!db) {
        db = await initializeDatabase();
    }
    if (!db) {
        throw new Error('Không thể khởi tạo hoặc kết nối DB.');
    }
    return db;
};

/**
 * Execute a SQL statement within a transaction.
 * @param sql SQL statement (INSERT, UPDATE, DELETE, SELECT)
 * @param params Parameters for the SQL statement
 * @returns Promise<any>
 */
export const executeSql = async (
    sql: string,
    params: any[] = []
): Promise<any> => {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        database.transaction(
            (tx: any) => {
                tx.executeSql(
                    sql,
                    params,
                    (_: any, result: any) => resolve(result),
                    (_: any, error: any) => {
                        console.error(`❌ Lỗi thực thi SQL: ${sql}`, error);
                        reject(error);
                        return false;
                    }
                );
            },
            (error: any) => {
                console.error('❌ Lỗi transaction:', error);
                reject(error);
            }
        );
    });
};
