import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
                    <MaterialIcons name="dashboard" size={28} color="#ff69b4" />
                    <Text style={styles.title}>Bảng Điều Khiển</Text>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsWrapper}>
                    {/* Sản phẩm */}
                    <View style={styles.statItem}>
                        <LinearGradient
                            colors={['#ff69b4', '#ff8dc7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statIconContainer}
                        >
                            <MaterialIcons name="inventory" size={24} color="#fff" />
                        </LinearGradient>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{loading ? '-' : stats.products.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Sản phẩm</Text>
                        </View>
                    </View>

                    {/* Danh mục */}
                    <View style={styles.statItem}>
                        <LinearGradient
                            colors={['#28A745', '#34ce57']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statIconContainer}
                        >
                            <MaterialIcons name="folder" size={24} color="#fff" />
                        </LinearGradient>
                        <View style={styles.statContent}>
                            <Text style={[styles.statValue, { color: '#28A745' }]}>{loading ? '-' : stats.categories.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Danh mục</Text>
                        </View>
                    </View>

                    {/* Đơn hàng */}
                    <View style={styles.statItem}>
                        <LinearGradient
                            colors={['#FFC107', '#ffd54f']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statIconContainer}
                        >
                            <MaterialIcons name="receipt" size={24} color="#fff" />
                        </LinearGradient>
                        <View style={styles.statContent}>
                            <Text style={[styles.statValue, { color: '#FF9800' }]}>{loading ? '-' : stats.orders.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Đơn hàng</Text>
                        </View>
                    </View>
                </View>

                {/* Management Sections */}
                <View style={styles.sectionTitleContainer}>
                    <MaterialIcons name="settings" size={20} color="#ff69b4" />
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
        paddingTop: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ff69b4',
    },
    statsWrapper: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ff69b4',
        marginBottom: 2,
        letterSpacing: -0.5,
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
        borderLeftColor: '#ff69b4',
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