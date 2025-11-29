import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
    Modal
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { Product, Category, fetchCategories, fetchProductsByCategory, fetchProducts } from '../../../database/database';
import CategorySelector from '../../../components/CategorySelector';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Define navigation and route types for stack
type ProductsByCategoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductsByCategory'>;
type ProductsByCategoryRouteProp = RouteProp<RootStackParamList, 'ProductsByCategory'>;

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

export default function ProductsByCategoryScreen() {
    const navigation = useNavigation<ProductsByCategoryNavigationProp>();
    const route = useRoute<ProductsByCategoryRouteProp>();

    const { categoryId, categoryName } = route.params;

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(categoryId || null);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    // 1. Fetch Categories when component mounts
    useEffect(() => {
        navigation.setOptions({
            title: categoryName || 'Sản phẩm theo danh mục',
            headerStyle: {
                backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: '600',
            },
        });
        fetchCategories().then(setCategories);
    }, [categoryName, navigation]);

    // 2. Fetch Products when selectedCategoryId changes
    useEffect(() => {
        const fetchProductsData = async () => {
            if (selectedCategoryId === null) {
                // Fetch all products
                const allProducts = await fetchProducts();
                setProducts(allProducts);
            } else {
                // Fetch products by category
                const categoryProducts = await fetchProductsByCategory(selectedCategoryId);
                setProducts(categoryProducts);
            }
        };

        fetchProductsData();

        let title = 'Tất cả sản phẩm';
        if (selectedCategoryId !== null) {
            const currentCategory = categories.find(cat => cat.id === selectedCategoryId);
            if (currentCategory) {
                title = currentCategory.name;
            }
        }
        navigation.setOptions({
            title: title,
        });

        // Animation when products change
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [selectedCategoryId, categories, navigation]);

    // Reset animation when products change
    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [products]);

    const getImageSource = (img: string | null) => {
        if (!img) {
            return require('../../../assets/images/products/shop-thoi-trang-nu.jpg');
        }

        const cleanImg = img.trim();
        if (cleanImg.startsWith('file://') || cleanImg.startsWith('http')) return { uri: cleanImg };

        return require('../../../assets/images/products/shop-thoi-trang-nu.jpg');
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    const handleCategorySelect = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setShowFilter(false); // Close modal after selection
    };

    const renderProductCard = ({ item, index }: { item: Product; index: number }) => (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                activeOpacity={0.9}
            >
                <View style={styles.imageContainer}>
                    <Image source={getImageSource(item.img)} style={styles.image} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.1)']}
                        style={styles.imageGradient}
                    />

                    {/* Badge for new product */}
                    {index % 4 === 0 && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>MỚI</Text>
                        </View>
                    )}

                    {/* Favorite icon */}
                    <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Ionicons name="star-half" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>(4.5)</Text>
                    </View>

                    <Text style={styles.price}>{formatPrice(item.price)} đ</Text>

                    <View style={styles.deliveryInfo}>
                        <Ionicons name="time-outline" size={12} color="#666" />
                        <Text style={styles.deliveryText}>Giao trong 2h</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
            <AppHeader />

            {/* Product Counter and Filter Button */}
            <View style={styles.productCounter}>
                <Text style={styles.productCounterText}>
                    {products.length} sản phẩm
                </Text>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilter(true)}
                >
                    <Ionicons name="filter" size={16} color="#666" />
                    <Text style={styles.filterText}>Lọc</Text>
                </TouchableOpacity>
            </View>

            {/* Modal Filter */}
            <Modal
                visible={showFilter}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilter(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Lọc theo danh mục</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowFilter(false)}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Category Selector */}
                        <View style={styles.selectorContainer}>
                            <CategorySelector
                                categories={categories}
                                selectedId={selectedCategoryId}
                                onSelect={handleCategorySelect}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => handleCategorySelect(null)}
                            >
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setShowFilter(false)}
                            >
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Products List */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.flatListContent}
                renderItem={renderProductCard}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wine-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
                        <Text style={styles.emptyText}>
                            Hiện không có sản phẩm nào trong danh mục này.
                        </Text>
                    </View>
                }
            />
            <AppFooter activeScreen="CategoryManagement" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    productCounter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productCounterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginLeft: 4,
    },
    flatListContent: {
        padding: CARD_MARGIN,
        paddingBottom: 100, // Increase padding to avoid footer covering content
    },
    cardContainer: {
        width: CARD_WIDTH,
        margin: CARD_MARGIN / 2,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 120,
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    imageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '30%',
    },
    newBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        fontSize: 14,
        color: '#1a1a1a',
        lineHeight: 18,
        marginBottom: 6,
        height: 36,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    price: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#B83227',
        marginBottom: 4,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    selectorContainer: {
        maxHeight: 400,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    applyButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#B83227',
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});