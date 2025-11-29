import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
    Cart: undefined;
    Admin: undefined;
    Login: undefined;
    ProductsByCategory: { categoryId: number; categoryName: string };
    About: undefined;
    Home: undefined;
    Explore: undefined;
    CategoryManagement: undefined;
    User: undefined;
    AddProduct: undefined;
    EditProduct: { productId: number };
    UserManagement: undefined;
    ProductManagement: undefined;
};

export default function AppHeader() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    const { user, isAdmin, logout } = useAuth();

    return (
        <View>
            {/* ... Phần Top Bar (Logo, Cart, User) Giữ Nguyên ... */}
            <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 30) }]}>
                <Text style={styles.title}>👗 Lady Shop</Text>
                <View style={styles.topBarRight}>
                    {user ? (
                        <View style={styles.userSectionRow}>
                            <Text style={styles.userText}>{user}</Text>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={() => {
                                    Alert.alert('Xác nhận', 'Bạn có muốn đăng xuất không?', [
                                        { text: 'Hủy', style: 'cancel' },
                                        { text: 'Đăng xuất', style: 'destructive', onPress: () => { logout(); navigation.navigate('Home'); } }
                                    ]);
                                }}
                            >
                                <Text style={styles.logoutText}>Đăng xuất</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Thanh truy cập Admin - Chỉ hiển thị nếu là admin */}
            {isAdmin && (
                <TouchableOpacity
                    style={{ padding: 10, backgroundColor: '#ff69b4', borderRadius: 0 }}
                    onPress={() => navigation.navigate('Admin')}
                >
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>🔑 Trang Admin (Quản lý)</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ffb6c1',
        paddingTop: 30,
        paddingBottom: 5,
    },

    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    topBarText: {
        fontSize: 22,
        color: '#000',
    },
    userSection: {
        alignItems: 'flex-end',
    },
    userSectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoutButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    logoutText: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    userText: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
    },
    loginText: {
        fontSize: 14,
        color: '#ff69b4',
        fontWeight: 'bold',
    },
});