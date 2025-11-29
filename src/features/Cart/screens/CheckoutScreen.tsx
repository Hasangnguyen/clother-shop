import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createOrder } from '../../../database/database';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

export default function CheckoutScreen({ navigation }: any) {
    const { cartItems, getTotal, clearCart } = useCart();
    const { userId, user } = useAuth();
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper function to validate phone number format
    const validatePhoneNumber = (phone: string): boolean => {
        // Validate phone number contains only digits and optional + at start
        // and length between 9 and 15
        const phoneRegex = /^(\+)?[0-9]{9,15}$/;
        return phoneRegex.test(phone);
    };

    const handlePurchase = async () => {
        if (!user) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua hàng.');
            return;
        }
        if (!address.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng.');
            return;
        }
        if (!phoneNumber.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại.');
            return;
        }
        if (!validatePhoneNumber(phoneNumber.trim())) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ.');
            return;
        }
        setLoading(true);
        try {
            const items = cartItems.map(ci => ({
                productId: ci.product.id,
                quantity: ci.quantity,
                price: ci.product.price
            }));
            const total = getTotal();
            if (userId) {
                await createOrder(userId, items, total, address, phoneNumber.trim());
            } else {
                throw new Error('User ID not found');
            }
            clearCart();
            setAddress('');
            setPhoneNumber('');
            Alert.alert('Thành công', 'Đơn hàng đã được tạo!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tạo đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader />
            <View style={styles.content}>
                <Text style={styles.title}>Nhập Thông Tin Giao Hàng</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ giao hàng"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />
                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
                <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={handlePurchase}
                    disabled={loading}
                >
                    <Text style={styles.purchaseText}>{loading ? 'Đang xử lý...' : 'Xác nhận mua hàng'}</Text>
                </TouchableOpacity>
            </View>
            <AppFooter activeScreen="Checkout" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8f9fa'
    },
    content: {
        flex: 1, padding: 20
    },
    title: {
        fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    purchaseButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    purchaseText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
});
