import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { fetchProducts, fetchCategories, fetchAllOrders } from '../../../database/database';

type AdminStackParamList = {
    AdminDashboard: undefined;
    ProductManagement: undefined;
    AddProduct: undefined;
    EditProduct: { productId: number };
    UserManagement: undefined;
    CategoryManagement: undefined;
    OrderManagement: undefined;
};

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

export default function AdminDashboard() {
    const navigation = useNavigation<AdminDashboardNavigationProp>();
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const [products, categories, orders] = await Promise.all([
                fetchProducts(),
                fetchCategories(),
                fetchAllOrders(),
            ]);
            setStats({
                products: products.length,
                categories: categories.length,
                orders: orders.length,
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader />
            <ScrollView style={styles.content}>
                <View style={styles.titleContainer}>
                    <MaterialIcons name="dashboard" size={28} color="#333" />
                    <Text style={styles.title}>Bảng Điều Khiển</Text>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { borderLeftColor: '#ff69b4' }]}>
                        <MaterialIcons name="inventory" size={32} color="#ff69b4" />
                        <Text style={styles.statValue}>{loading ? '-' : stats.products}</Text>
                        <Text style={styles.statLabel}>Sản phẩm</Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: '#28A745' }]}>
                        <MaterialIcons name="folder" size={32} color="#28A745" />
                        <Text style={styles.statValue}>{loading ? '-' : stats.categories}</Text>
                        <Text style={styles.statLabel}>Danh mục</Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: '#FFC107' }]}>
                        <MaterialIcons name="receipt" size={32} color="#FFC107" />
                        <Text style={styles.statValue}>{loading ? '-' : stats.orders}</Text>
                        <Text style={styles.statLabel}>Đơn hàng</Text>
                    </View>
                </View>

                {/* Management Sections */}
                <View style={styles.sectionTitleContainer}>
                    <MaterialIcons name="settings" size={20} color="#333" />
                    <Text style={styles.sectionTitle}>Quản Lý</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('CategoryManagement')}
                    >
                        <MaterialIcons name="folder" size={32} color="#ff69b4" />
                        <Text style={styles.buttonTitle}>Quản Lý Danh Mục</Text>
                        <Text style={styles.buttonDescription}>Xem và quản lý danh mục sản phẩm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('ProductManagement')}
                    >
                        <MaterialIcons name="inventory" size={32} color="#ff69b4" />
                        <Text style={styles.buttonTitle}>Quản Lý Sản Phẩm</Text>
                        <Text style={styles.buttonDescription}>Xem, sửa, xóa sản phẩm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('UserManagement')}
                    >
                        <MaterialIcons name="people" size={32} color="#ff69b4" />
                        <Text style={styles.buttonTitle}>Quản Lý Người Dùng</Text>
                        <Text style={styles.buttonDescription}>Xem và quản lý tài khoản người dùng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dashboardButton}
                        onPress={() => navigation.navigate('OrderManagement')}
                    >
                        <MaterialIcons name="shopping-cart" size={32} color="#ff69b4" />
                        <Text style={styles.buttonTitle}>Quản Lý Đơn Hàng</Text>
                        <Text style={styles.buttonDescription}>Xem và xử lý các đơn hàng</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AppFooter activeScreen="Admin" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 4,
        gap: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 20,
    },
    dashboardButton: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#dc3545',
        gap: 8,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    buttonDescription: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
});