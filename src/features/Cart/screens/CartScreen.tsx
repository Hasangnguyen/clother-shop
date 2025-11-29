import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
    const { user } = useAuth();
    const navigation = useNavigation<CartScreenNavigationProp>();
    const [loading, setLoading] = useState(false);

    const renderItem = ({ item }: any) => (
        <View style={styles.item}>
            <Text style={styles.name}>{item.product.name}</Text>
            <Text style={styles.price}>{item.product.price.toLocaleString()}₫</Text>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity - 1)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity + 1)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.button}>
                <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
        </View>
    );

    const total = getTotal();

    const handleBuyPress = () => {
        if (!user) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua hàng.');
            return;
        }
        if (cartItems.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng chưa có sản phẩm.');
            return;
        }
        navigation.navigate('Checkout');
    };

    return (
        <View style={styles.container}>
            <AppHeader />
            <View style={styles.content}>
                <Text style={styles.title}>Giỏ Hàng</Text>

                {cartItems.length === 0 ? (
                    <Text style={{ textAlign: 'center' }}>Chưa có sản phẩm nào</Text>
                ) : (
                    <>
                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) => item.product.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />
                        <Text style={styles.total}>Tổng: {total.toLocaleString()}₫</Text>
                        <TouchableOpacity style={styles.purchaseButton} onPress={handleBuyPress} disabled={loading}>
                            <Text style={styles.purchaseText}>{loading ? 'Đang xử lý...' : 'Mua hàng'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                            <Text style={styles.clearText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <AppFooter activeScreen="Cart" />
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
        fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center'
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    name: {
        fontSize: 16, fontWeight: '500'
    },
    price: {
        fontSize: 14, color: '#28a745', marginTop: 5
    },
    button: {
        marginTop: 10,
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 6,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff', fontWeight: 'bold'
    },
    clearButton: {
        marginTop: 20,
        backgroundColor: '#6c757d',
        padding: 12, borderRadius: 8, alignItems: 'center'
    },
    clearText: {
        color: '#fff', fontWeight: 'bold'
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    qtyButton: {
        backgroundColor: '#ff69b4',
        padding: 5,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    qtyText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        height: 60,
        textAlignVertical: 'top',
    },
    purchaseButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,

        alignItems: 'center', marginBottom: 10
    },
    purchaseText: {
        color: '#fff',
        fontWeight: 'bold'
    },
});
