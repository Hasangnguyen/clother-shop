import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addToCart } from '../features/Cart/services/cartService';
import { Product } from '../features/Products/models/Product';

type RootStackParamList = {
    ProductList: undefined;
    ProductDetail: { product: Product };
    Cart: undefined;
    Checkout: undefined;
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface Props {
    route: ProductDetailRouteProp;
    navigation: ProductDetailNavigationProp;
}

const ProductDetail: React.FC<Props> = ({ route, navigation }) => {
    const { product } = route.params;

    const getImageSource = (img?: string) => {
        if (img && img.startsWith('file://')) {
            return { uri: img };
        }
        return require('../components/assets/images/images.jpg');
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id);
            Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
        }
    };

    const handleBuyNow = () => {
        // For now, just add to cart and navigate to cart
        handleAddToCart().then(() => {
            navigation.navigate('Cart');
        });
    };

    return (
        <View style={styles.container}>
            <Image source={getImageSource(product.img ?? product.image)} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
                <Text style={styles.description}>Mô tả sản phẩm: {product.name} chất lượng cao.</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
                    <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buyButton]} onPress={handleBuyNow}>
                    <Text style={styles.buttonText}>Mua ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
    details: {
        marginTop: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        color: '#28a745',
        fontWeight: '600',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    button: {
        backgroundColor: '#ff69b4',
        padding: 15,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buyButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProductDetail;
