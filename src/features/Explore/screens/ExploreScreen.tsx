import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Assume: Product model and database function are imported correctly
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { fetchProducts, searchProductsByNameOrCategory, Product } from '../../../database/database';
import { fetchProductsByPriceRange } from '../../../database/database';

// Ensure this RootStackParamList matches your AppNavigator.tsx file
type RootStackParamList = {
    Home: undefined;
    Explore: undefined;
    ProductDetail: { product: Product };
    Cart: undefined;
    Admin: undefined;
    // Add other routes if needed
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 30) / 2; // 2 items per row with padding

export default function ExploreScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Function to load and filter products (Combine search and price filter)
    useEffect(() => {
        const loadProducts = async () => {
            try {
                let result: Product[] = [];

                // 1. Search by keyword (if any)
                if (searchKeyword.trim() !== '') {
                    result = await searchProductsByNameOrCategory(searchKeyword);
                } else {
                    // If no keyword, get all products
                    result = await fetchProducts();
                }

                // 2. Filter by price (if any)
                if (minPrice !== '' && maxPrice !== '') {
                    const min = parseFloat(minPrice);
                    const max = parseFloat(maxPrice);

                    if (!isNaN(min) && !isNaN(max) && min <= max) {
                        // Filter results by price range
                        result = result.filter(product => {
                            return product.price >= min && product.price <= max;
                        });
                    }
                } else if (minPrice !== '') {
                    // Only minimum price
                    const min = parseFloat(minPrice);
                    if (!isNaN(min)) {
                        result = result.filter(product => product.price >= min);
                    }
                } else if (maxPrice !== '') {
                    // Only maximum price
                    const max = parseFloat(maxPrice);
                    if (!isNaN(max)) {
                        result = result.filter(product => product.price <= max);
                    }
                }

                setProducts(result);

            } catch (error) {
                console.error('Lỗi khi tải sản phẩm:', error);
            }
        };

        loadProducts();
    }, [searchKeyword, minPrice, maxPrice]);

    const onSearchChange = (keyword: string) => {
        setSearchKeyword(keyword);
    };

    const onMinPriceChange = (value: string) => {
        setMinPrice(value.replace(/[^0-9]/g, '')); // Only allow numbers
    };

    const onMaxPriceChange = (value: string) => {
        setMaxPrice(value.replace(/[^0-9]/g, '')); // Only allow numbers
    };


    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            <Image
                source={item.img ? { uri: item.img } : require('../../../assets/images/products/shop-thoi-trang-nu.jpg')}
                style={styles.productImage}
                resizeMode="cover"
            />
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}₫</Text>
        </TouchableOpacity>
    );

    // Start RETURN block correctly (REMOVED DUPLICATE RETURN BLOCK)
    return (
        <View style={styles.container}>
            <AppHeader />
            <Text style={styles.heading}>Khám Phá Sản Phẩm</Text>

            {/* Search bar */}
            <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm hoặc thương hiệu"
                value={searchKeyword}
                onChangeText={onSearchChange}
                clearButtonMode="while-editing"
            />

            {/* Price filter */}
            <View style={styles.priceFilterContainer}>
                <TextInput
                    style={styles.priceInput}
                    placeholder="Giá từ"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={onMinPriceChange}
                />
                <Text style={styles.toText}>-</Text>
                <TextInput
                    style={styles.priceInput}
                    placeholder="Đến"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={onMaxPriceChange}
                />
            </View>

            {/* Product list */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduct}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy sản phẩm nào.</Text>}
            />

            <AppFooter activeScreen="Explore" />
        </View>
    );
}
// End of ExploreScreen component

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
        paddingHorizontal: 15,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 100, // Increase padding to avoid footer covering content
    },
    productItem: {
        width: itemWidth,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 12,
        color: '#555',
        fontWeight: 'bold',
    },
    searchInput: {
        height: 40,
        marginHorizontal: 15,
        marginBottom: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    priceFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    toText: {
        marginHorizontal: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
});