import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import components and database
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { initializeDatabase, fetchProducts, fetchCategories, Product, Category } from '../../../database/database';
import { useCart } from '../../../context/CartContext';

// Component for a Quick View item
const QuickViewItem = ({ item, onPress }: { item: Category; onPress: () => void }) => (
    <TouchableOpacity
        style={styles.quickViewItem}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.quickViewIconContainer}>
            <Image source={{ uri: item.iconUri || 'https://via.placeholder.com/100' }} style={styles.quickViewIcon} />
        </View>
        <Text style={styles.quickViewText}>{item.name}</Text>
    </TouchableOpacity>
);

type RootStackParamList = {
    Home: undefined;
    ProductDetail: { product: Product };
    Cart: undefined;
    Admin: undefined;
    Explore: undefined;
    CategoryManagement: undefined;
    User: undefined;
    About: undefined;
    ProductsByCategory: { categoryId: number, categoryName: string };
};

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Initialize database 
                await initializeDatabase(() => {
                    console.log('Database initialized successfully!');
                });

                // Fetch data
                const existingProducts = await fetchProducts();
                setProducts(existingProducts);

                const existingCategories = await fetchCategories();
                setCategories(existingCategories);
            } catch (error) {
                console.error('Error loading home screen data:', error);
            }
        };
        loadData();
    }, []);

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    return (
        <View style={styles.container}>
            <AppHeader />

            {/* Product list */}
            <FlatList
                data={products}
                keyExtractor={(item) => `product-${item.id}`}
                key={2}
                // >>> CHANGE 1: Set up 2 columns
                numColumns={2}
                columnWrapperStyle={styles.row} // Apply spacing between columns
                renderItem={({ item }: { item: Product }) => (
                    <TouchableOpacity 
                        style={styles.item} 
                        onPress={() => navigation.navigate('ProductDetail', { product: item })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={item.img ? { uri: item.img } : require('../../../assets/images/products/shop-thoi-trang-nu.jpg')}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.price}>{formatPrice(item.price)}₫</Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={(e) => { e.stopPropagation?.(); addToCart(item); }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.buttonText}>Thêm vào giỏ</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                // **SOLUTION FOR TEXT STRING ERROR:** Wrap entire header in a single <View>
                ListHeaderComponent={
                    <View>
                        {/* Advertisement Banner */}
                        <View style={styles.bannerContainer}>
                            <Image source={require('../../../assets/images/products/shop-thoi-trang-nu.jpg')} style={styles.bannerImage} />
                            <View style={styles.bannerOverlay}>
                                <Text style={styles.bannerText}>👗 Lady Shop</Text>
                                <Text style={styles.bannerSubtext}>Thời trang cho phái đẹp</Text>
                            </View>
                        </View>

                        {/* "Product Categories" Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.quickViewHeading}>✨ Danh Mục Sản Phẩm</Text>
                        </View>
                        <View style={styles.quickViewGrid}>
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id.toString()}
                                key={3}
                                renderItem={({ item }: { item: Category }) => <QuickViewItem item={item} onPress={() => navigation.navigate('ProductsByCategory', { categoryId: item.id, categoryName: item.name })} />}
                                numColumns={3}
                                scrollEnabled={false}
                                columnWrapperStyle={styles.quickViewRow}
                            />
                        </View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.heading}>🛍️ Sản Phẩm Nổi Bật</Text>
                        </View>
                    </View>
                }
                contentContainerStyle={styles.flatListContentContainer}
            />

            <AppFooter activeScreen="Home" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    // --- Advertisement Banner ---
    bannerContainer: {
        width: '100%',
        height: 180,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 15,
        marginTop: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 15,
        paddingTop: 20,
    },
    bannerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    bannerSubtext: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },

    // --- Section Header ---
    sectionHeader: {
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 12,
    },
    
    // --- Quick View / Categories (Product Categories) ---
    quickViewHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    quickViewGrid: {
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    quickViewRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    quickViewItem: {
        width: '30%',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    quickViewIconContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    quickViewIcon: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    quickViewText: {
        fontSize: 11,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },

    // --- Product List (2 columns) ---
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 5,
    },
    item: {
        width: '48%',
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        minHeight: 38,
        lineHeight: 19,
    },
    price: {
        fontSize: 16,
        color: '#ff69b4',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#ff69b4',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    flatListContentContainer: {
        paddingBottom: 100,
    },
});