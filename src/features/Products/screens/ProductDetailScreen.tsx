import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product } from '../models/Product';

import { useCart } from '../../../context/CartContext';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

// Define complete RootStackParamList to avoid TypeScript errors in AppFooter/Navigation
type RootStackParamList = {
    Home: undefined;
    Explore: undefined;
    ProductDetail: { product: Product };
    Cart: undefined;
    Admin: undefined;
    CategoryManagement: undefined;
    User: undefined;
    About: undefined;
    ProductsByCategory: { categoryId: number, categoryName: string };
    // Add other screens if needed
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface Props {
    route: ProductDetailRouteProp;
    navigation: ProductDetailNavigationProp;
}

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { product } = route.params;
    const { addToCart } = useCart();

    // Get accurate product name
    const productName = product.name || (product as any).title || 'Sản phẩm không tên';
    const productDescription = (product as any).description || `Mô tả sản phẩm: ${productName} chất lượng cao.`;

    const getImageSource = (img?: string) => {
        const cleanImg = img?.trim();
        if (cleanImg && (cleanImg.startsWith('file://') || cleanImg.startsWith('http'))) {
            return { uri: cleanImg };
        }
        // Use default image
        return require('../../../assets/images/products/shop-thoi-trang-nu.jpg');
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    const handleAddToCart = () => {
        addToCart(product);
        Alert.alert('Thành công', `${productName} đã được thêm vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigation.navigate('Cart');
    };

    return (
        
        // Wrap entire View in ScrollView and add flex: 1 style to ScrollView
        <View style={styles.container}>
            <AppHeader />

            <ScrollView style={styles.contentWrapper}>
                {/* Image Section */}
                <Image
                    source={getImageSource(product.img || (product as any).image)}
                    style={styles.image}
                    resizeMode="contain" // Change to 'contain' so product image is not cut off
                />

                {/* Details Section */}
                <View style={styles.details}>
                    <Text style={styles.name}>{productName}</Text>
                    <Text style={styles.price}>{formatPrice(product.price)} ₫</Text>
                    {/* Button Section */}
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
                            <Text style={styles.buttonText}>➕ Thêm vào giỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buyButton]} onPress={handleBuyNow}>
                            <Text style={styles.buttonText}>Mua ngay</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.descriptionHeader}>Mô tả chi tiết</Text>
                    <Text style={styles.description}>
                        {productDescription}
                    </Text>
                </View>
            </ScrollView>

            {/* Ensure AppFooter is not cut off */}
            <AppFooter activeScreen="Home" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Lighter background
    },
    scrollContent: {
        paddingBottom: 100, // Need larger padding to avoid AppFooter covering end content
    },
    contentWrapper: {
        paddingHorizontal: 20, // Keep content padding
    },
    image: {
        width: '100%',
        height: 350, // Increase height to see product image more clearly
        borderRadius: 12,
        backgroundColor: '#FFFFFF', // White background for image area
        marginTop: 10,
        // Use resizeMode: 'contain' in component
    },
    details: {
        marginTop: 25,
        paddingBottom: 10,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
    },
    price: {
        fontSize: 24,
        color: '#B83227', // Red price color
        fontWeight: '700',
        marginBottom: 20,
    },
    descriptionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginTop: 15,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    infoBox: {
        backgroundColor: '#F0F8FF', // Light blue background for highlighted information
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 3,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 20, // Add spacing before footer
    },
    button: {
        backgroundColor: '#ff69b4',
        paddingVertical: 14,
        borderRadius: 10, // Slight rounded corners
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buyButton: {
        backgroundColor: '#B83227', // Buy now color synchronized with price color
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProductDetailScreen;