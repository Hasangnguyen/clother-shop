import React, { useEffect, useState, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';

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
    const categoryListRef = useRef<FlatList>(null);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

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

    // Auto-scroll carousel for categories
    useEffect(() => {
        if (categories.length === 0) return;

        const itemWidth = 100; // width of each item
        const itemSpacing = 12; // marginRight
        const itemTotalWidth = itemWidth + itemSpacing;

        const interval = setInterval(() => {
            setCurrentCategoryIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % categories.length;
                const offset = nextIndex * itemTotalWidth;
                categoryListRef.current?.scrollToOffset({
                    offset: offset,
                    animated: true,
                });
                return nextIndex;
            });
        }, 3000); // Auto-scroll every 3 seconds

        return () => clearInterval(interval);
    }, [categories.length]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    return (
        <View style={styles.container}>
            <AppHeader />

            {/* Product list */}
            <FlatList
                data={products.slice(0, 6)}
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
                                <View style={styles.bannerTitleContainer}>
                                    <MaterialIcons name="shopping-bag" size={28} color="#fff" />
                                    <Text style={styles.bannerText}>Lady Shop</Text>
                                </View>
                                <Text style={styles.bannerSubtext}>Thời trang cho phái đẹp</Text>
                            </View>
                        </View>

                        {/* "Product Categories" Section */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.quickViewHeadingContainer}>
                                <MaterialIcons name="category" size={20} color="#ff69b4" />
                                <Text style={styles.quickViewHeading}>Danh Mục Sản Phẩm</Text>
                            </View>
                        </View>
                        <View style={styles.quickViewContainer}>
                            <FlatList
                                ref={categoryListRef}
                                data={categories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }: { item: Category }) => <QuickViewItem item={item} onPress={() => navigation.navigate('ProductsByCategory', { categoryId: item.id, categoryName: item.name })} />}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.quickViewList}
                                pagingEnabled={false}
                                snapToInterval={112} // item width (100) + marginRight (12)
                                decelerationRate="fast"
                            />
                        </View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.heading}>🛍️ Sản Phẩm Nổi Bật</Text>
                        </View>
                    </View>
                }
                ListFooterComponent={
                    products.length > 6 ? (
                        <View style={styles.viewMoreContainer}>
                            <TouchableOpacity 
                                style={styles.viewMoreButton}
                                onPress={() => navigation.navigate('Explore')}
                            >
                                <MaterialIcons name="explore" size={20} color="#fff" />
                                <Text style={styles.viewMoreText}>Xem thêm sản phẩm</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
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
    bannerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    bannerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
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
    quickViewHeadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quickViewHeading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff69b4',
    },
    quickViewContainer: {
        marginBottom: 20,
    },
    quickViewList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    quickViewItem: {
        width: 100,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginRight: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        color: '#ff69b4',
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
    viewMoreContainer: {
        padding: 20,
        alignItems: 'center',
    },
    viewMoreButton: {
        backgroundColor: '#ff69b4',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    viewMoreText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});