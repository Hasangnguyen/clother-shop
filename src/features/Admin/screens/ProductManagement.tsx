import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert, Image, Dimensions, ActivityIndicator, TextInput
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

// Import Database & Models (Ensure path is correct for your project)
import { 
    fetchProducts, 
    deleteProduct as deleteProductDB,
    addProduct,
    updateProduct,
    fetchCategories,
    Category
} from '../../../database/database';
import { Product } from '../../Products/models/Product'; // Or your model file path

import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

// --- GRID UI CONFIGURATION ---
const { width } = Dimensions.get('window');
const SPACING = 12; // Spacing between items
const COLUMN_WIDTH = (width - SPACING * 3) / 2; // Calculate width to evenly divide into 2 columns

// Define Navigation type
type RootStackParamList = {
    AddProduct: { productId?: number };
};
type ProductManagementNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductManagement() {
    const navigation = useNavigation<ProductManagementNavigationProp>();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    
    // Form states
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCategoryId, setProductCategoryId] = useState<number | null>(null);
    const [productImageUri, setProductImageUri] = useState<string | null>(null);
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);

    // --- 1. LOAD DATA ---
    // Use useFocusEffect to automatically reload when returning to this screen
    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        setLoading(true);
        try {
            const [allProducts, allCategories] = await Promise.all([
                fetchProducts(),
                fetchCategories()
            ]);
            // Reverse array to show newest products first
            setProducts(allProducts.reverse());
            setCategories(allCategories);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // --- 2. IMAGE HANDLING ---
    const getImageSource = (img?: string | null) => {
        const defaultImg = require('../../../assets/images/products/shop-thoi-trang-nu.jpg'); // Default image
        if (!img || img.trim() === '') return defaultImg;

        // Image from internet URL (http/https)
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return { uri: img };
        }

        // Image from device library (file://)
        if (img.startsWith('file://')) {
            return { uri: img };
        }

        // Static image mapping (if you store filename in DB)
        switch (img) {
            case 'hinh1.jpg': return defaultImg;
            default: return defaultImg;
        }
    };

    // --- 3. ADD / EDIT / DELETE FUNCTIONALITY ---
    const handleAddProduct = async () => {
        if (!productName.trim() || !productPrice.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (!productCategoryId) {
            Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
            return;
        }

        try {
            if (editingProductId !== null) {
                await updateProduct({
                    id: editingProductId,
                    name: productName.trim(),
                    price: parseFloat(productPrice),
                    img: productImageUri || 'hinh1.jpg',
                    categoryId: productCategoryId,
                });
                Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
            } else {
                await addProduct({
                    name: productName.trim(),
                    price: parseFloat(productPrice),
                    img: productImageUri || 'hinh1.jpg',
                    categoryId: productCategoryId,
                });
                Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
            }
            // Reset form
            setProductName('');
            setProductPrice('');
            setProductCategoryId(null);
            setProductImageUri(null);
            setIsAddingProduct(false);
            setEditingProductId(null);
            loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProductId(product.id as number);
        setProductName(product.name || '');
        setProductPrice(product.price?.toString() || '');
        setProductCategoryId(product.categoryId ?? null);
        setProductImageUri(product.img ?? null);
        setIsAddingProduct(true);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập ảnh.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setProductImageUri(result.assets[0].uri ?? null);
        }
    };

    const handleDelete = (product: Product) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa "${product.name}" không?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (product.id) {
                                await deleteProductDB(product.id);
                                loadProducts(); // Reload after deletion
                                Alert.alert('Thành công', 'Đã xóa sản phẩm');
                            }
                        } catch (e) {
                            Alert.alert('Lỗi', 'Xóa thất bại');
                        }
                    }
                },
            ]
        );
    };

    // --- 4. PRODUCT ITEM UI (GRID ITEM) ---
    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail' as any, { product: item } as any)}>
            {/* Product image */}
            <View style={styles.imageContainer}>
                <Image
                    source={getImageSource(item.img ?? 'hinh1.jpg')}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{item.price.toLocaleString()} đ</Text>
                </View>
            </View>

            {/* Information & Buttons */}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnEdit]}
                        onPress={() => handleEdit(item)}
                    >
                        <Text style={styles.btnText}>Sửa</Text>
                    </TouchableOpacity>

                    <View style={{ width: 8 }} />

                    <TouchableOpacity
                        style={[styles.btn, styles.btnDelete]}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.btnText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --- 5. MAIN RENDER ---
    return (
        <View style={styles.container}>
            <AppHeader />

            <View style={styles.body}>
                <View style={styles.headerTitleContainer}>
                    <MaterialIcons name="inventory" size={24} color="#ff69b4" />
                    <Text style={styles.headerTitle}>Quản Lý Sản Phẩm</Text>
                </View>
                <Text style={styles.subtitle}>Tổng số: {products.length} sản phẩm</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setIsAddingProduct(!isAddingProduct);
                        if (isAddingProduct) {
                            // Reset form when canceling
                            setProductName('');
                            setProductPrice('');
                            setProductCategoryId(null);
                            setProductImageUri(null);
                            setEditingProductId(null);
                        }
                    }}
                >
                    <Text style={styles.addButtonText}>
                        {isAddingProduct ? 'Hủy Thêm' : '+ Thêm Sản Phẩm'}
                    </Text>
                </TouchableOpacity>

                {isAddingProduct && (
                    <View style={styles.addForm}>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên sản phẩm"
                            value={productName}
                            onChangeText={setProductName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Giá"
                            keyboardType="numeric"
                            value={productPrice}
                            onChangeText={setProductPrice}
                        />
                        <View style={{ zIndex: 1000, marginBottom: 10 }}>
                            <View style={styles.labelContainer}>
                                <MaterialIcons name="folder" size={16} color="#ff69b4" />
                                <Text style={styles.labelText}>Danh mục:</Text>
                            </View>
                            <DropDownPicker
                                open={openCategoryDropdown}
                                value={productCategoryId}
                                items={categories.map(c => ({
                                    label: c.name,
                                    value: c.id
                                }))}
                                setOpen={setOpenCategoryDropdown}
                                setValue={setProductCategoryId}
                                placeholder="Chọn danh mục"
                                style={styles.dropdownPicker}
                                dropDownContainerStyle={styles.dropdownContainer}
                                textStyle={styles.dropdownText}
                                placeholderStyle={styles.dropdownPlaceholder}
                                disabled={categories.length === 0}
                                zIndex={1000}
                                zIndexInverse={1000}
                            />
                        </View>
                        <View style={styles.imageSection}>
                            {productImageUri ? (
                                <View>
                                    <Image 
                                        source={getImageSource(productImageUri)} 
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity 
                                        style={styles.changeImageBtn} 
                                        onPress={handlePickImage}
                                    >
                                        <Text style={styles.changeImageText}>Thay ảnh</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage}>
                                    <MaterialIcons name="add-photo-alternate" size={20} color="#ff69b4" />
                                    <Text style={styles.pickImageText}>Chọn ảnh</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.submitButton, editingProductId ? { backgroundColor: '#ffc107' } : {}]}
                            onPress={handleAddProduct}
                        >
                            <Text style={styles.submitButtonText}>
                                {editingProductId ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#ff69b4" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={renderProductItem}

                        // Configure 2-column Grid
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        contentContainerStyle={styles.listContent}

                        ListEmptyComponent={
                            <View style={styles.emptyView}>
                                <MaterialIcons name="inbox" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <AppFooter activeScreen="ProductManagement" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    body: { flex: 1 },

    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        paddingTop: 16,
    },
    headerTitle: {
        fontSize: 24, fontWeight: 'bold', color: '#ff69b4',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16, color: '#666',
        marginBottom: 20, textAlign: 'center'
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    addForm: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    labelText: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
        fontWeight: '500'
    },
    dropdownPicker: {
        backgroundColor: '#fafafa',
        borderColor: '#ddd',
        borderRadius: 8,
        minHeight: 40,
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderRadius: 8,
        borderWidth: 1,
    },
    dropdownText: {
        fontSize: 13,
        color: '#333',
    },
    dropdownPlaceholder: {
        color: '#999',
        fontSize: 13,
    },
    imageSection: {
        marginBottom: 10,
        alignItems: 'center',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 8,
    },
    changeImageBtn: {
        width: 100,
        height: 35,
        backgroundColor: '#ffc107',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff9800',
    },
    changeImageText: {
        fontSize: 12,
        color: '#000',
        fontWeight: 'bold',
    },
    pickImageBtn: {
        width: 100,
        height: 40,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pickImageText: {
        fontSize: 13,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#ff69b4',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },

    listContent: {
        paddingHorizontal: SPACING,
        paddingBottom: 80, // To avoid being covered by Footer
    },

    // --- CARD STYLES ---
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: SPACING,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
        elevation: 3, // Shadow for Android
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: COLUMN_WIDTH, // Square image
        width: '100%',
    },
    cardImage: {
        width: '100%', height: '100%',
    },
    priceTag: {
        position: 'absolute', bottom: 8, right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6,
    },
    priceText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    cardContent: { padding: 10 },
    cardTitle: {
        fontSize: 14, fontWeight: '600', color: '#333',
        height: 38, // Fixed name height to make cards equal
        marginBottom: 8,
    },

    // --- ACTION BUTTONS ---
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
    },
    btnEdit: { backgroundColor: '#e7f3ff' },
    btnDelete: { backgroundColor: '#ffecec' },

    btnText: { fontSize: 12, fontWeight: '600', color: '#333' },

    // --- EMPTY STATE ---
    emptyView: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#888', marginTop: 10, fontSize: 16 },
    btnAddNow: {
        marginTop: 15, backgroundColor: '#28a745',
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20
    }
});