// Product list displayed using FlatList
import React, { useEffect, useState } from 'react';
import {
    Alert,
    View, Text, TextInput, TouchableOpacity,
    Image, ScrollView, StyleSheet, FlatList, Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import {
    initializeDatabase,
    fetchCategories,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProductsByNameOrCategory,
    Product,
    Category,
} from '../../../database/database';

import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

// Get screen width to calculate column size
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 48 is total left/right padding and spacing between 2 columns

const Sanpham3Sqlite = () => {
    const route = useRoute();
    const params = route.params as { categoryId?: number; productId?: number } | undefined;
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState<number>(params?.categoryId ?? 1);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

    useEffect(() => {
        if (params?.categoryId) {
            setCategoryId(params.categoryId);
        }
        if (params?.productId) {
            // Load product data for editing
            const loadProductForEdit = async () => {
                try {
                    const allProducts = await fetchProducts();
                    const product = allProducts.find(p => p.id === params.productId);
                    if (product) {
                        setName(product.name);
                        setPrice(product.price.toString());
                        setCategoryId(product.categoryId ?? 1);
                        setImageUri(product.img ?? null);
                        setEditingId(product.id ?? null);
                    }
                } catch (error) {
                    console.error('Error loading product for edit:', error);
                    Alert.alert('Lỗi', 'Không thể tải dữ liệu sản phẩm để sửa');
                }
            };
            loadProductForEdit();
        }
    }, [params?.categoryId, params?.productId]);

    useEffect(() => {
        initializeDatabase(() => {
            loadData();
        });
    }, []);

    const loadData = async () => {
        const cats = await fetchCategories();
        const prods = await fetchProducts();
        setCategories(cats);
        setProducts(prods.reverse());
    };

    const handleAddOrUpdate = async () => {
        if (!name || !price) return;
        const productData = {
            name,
            price: parseFloat(price),
            img: imageUri || 'hinh1.jpg',
            categoryId,
        };

        try {
            if (editingId !== null) {
                await updateProduct({ id: editingId, ...productData });
                Alert.alert('Thành công', 'Đã cập nhật!');
            } else {
                await addProduct(productData);
                Alert.alert('Thành công', 'Đã thêm mới!');
            }
            setEditingId(null);
            setName('');
            setPrice('');
            setCategoryId(1);
            setImageUri(null);
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
        }
    };

    const handleEdit = (id: number) => {
        const p = products.find((x) => x.id === id);
        if (p) {
            setName(p.name);
            setPrice(p.price.toString());
            setCategoryId(p.categoryId ?? 1);
            setImageUri(p.img ?? null);
            if (typeof p.id === 'number') setEditingId(p.id);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Xác nhận', 'Bạn muốn xóa sản phẩm này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive',
                    onPress: async () => {
                        await deleteProduct(id);
                        loadData();
                    },
                },
            ]
        );
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập ảnh.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Allow square crop for better appearance
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri ?? null);
        }
    };

    const getImageSource = (img?: string | null) => {
        const defaultImg = require('../../../assets/images/products/shop-thoi-trang-nu.jpg');
        if (!img || img.trim() === '') return defaultImg;

        // Image from internet URL (http/https)
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return { uri: img };
        }

        // Image from device library (file://)
        if (img.startsWith('file://')) {
            return { uri: img };
        }

        // Static image mapping
        switch (img) {
            case 'hinh1.jpg': return defaultImg;
            default: return defaultImg;
        }
    };

    const handleSearch = async (keyword: string) => {
        if (keyword.trim() === '') {
            loadData();
        } else {
            const results = await searchProductsByNameOrCategory(keyword);
            setProducts(results.reverse());
        }
    };

    const displayedProducts = products.filter(p =>
        // treat both null and undefined as "All" (show everything)
        filterCategoryId == null ? true : p.categoryId === filterCategoryId
    );
    // --- RENDER GRID ITEM UI ---
    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.gridCard}>
            <View style={styles.imageContainer}>
                <Image source={getImageSource(item.img ?? 'hinh1.jpg')} style={styles.gridImage} />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{item.price.toLocaleString()}đ</Text>
                </View>
            </View>

            <View style={styles.gridInfo}>
                <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>

                <View style={styles.gridActions}>
                    <TouchableOpacity onPress={() => handleEdit(item.id as number)} style={styles.actionBtn}>
                        <Text style={[styles.actionText, { color: '#ff69b4' }]}>Sửa</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity onPress={() => handleDelete(item.id as number)} style={styles.actionBtn}>
                        <Text style={[styles.actionText, { color: '#dc3545' }]}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <AppHeader />
            <View style={{ flex: 1 }}>
                {/* Form Section - Thu gọn lại */}
                <View style={styles.formContainer}>
                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 220 }}>
                        <Text style={styles.headerTitle}>📦 Quản Lý & Danh Sách</Text>

                        <View style={styles.compactForm}>
                            <View style={styles.rowInput}>
                                <TextInput
                                    style={[styles.input, { flex: 2 }]}
                                    placeholder="Tên SP"
                                    value={name} onChangeText={setName}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Giá"
                                    keyboardType="numeric"
                                    value={price} onChangeText={setPrice}
                                />
                            </View>

                            <View style={styles.rowInput}>
                                <View style={{ width: 110 }}>
                                    <RNPickerSelect
                                        onValueChange={(value) => setFilterCategoryId(value)}
                                        items={categories.map((c) => ({ label: c.name, value: c.id }))}
                                        value={filterCategoryId}
                                        placeholder={{ label: "Tất cả", value: null }} // This is the "View All" button
                                        style={{
                                            inputAndroid: {
                                                fontSize: 13, color: '#333', paddingRight: 30
                                            },
                                            placeholder: { color: '#ff69b4', fontWeight: 'bold' }
                                        }}
                                        useNativeAndroidPickerStyle={false} // Disable default style for easier customization
                                    />
                                    {/* Small arrow to indicate dropdown menu */}
                                    <Text style={{ position: 'absolute', right: 0, top: 2, color: '#999', fontSize: 10 }}>▼</Text>
                                </View>
                                <TouchableOpacity style={styles.compactImgBtn} onPress={handlePickImage}>
                                    <Text>{imageUri ? '✅ Có ảnh' : '📷 Ảnh'}</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, editingId ? { backgroundColor: '#ffc107' } : {}]}
                                onPress={handleAddOrUpdate}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editingId ? 'Cập Nhật' : 'Thêm Mới'}
                                </Text>
                            </TouchableOpacity>
                            {editingId && (
                                <TouchableOpacity onPress={() => { setEditingId(null); setName(''); setPrice(''); setImageUri(null); }}>
                                    <Text style={{ textAlign: 'center', color: '#666', marginTop: 4, fontSize: 12 }}>Hủy sửa</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>

                {/* List Section - Grid Layout */}
                <View style={styles.listSection}>
                    <View style={styles.searchBar}>
                        <Text style={{ marginRight: 8 }}>🔍</Text>
                        <TextInput
                            style={{ flex: 1 }}
                            placeholder="Tìm kiếm..."
                            onChangeText={handleSearch}
                        />
                    </View>

                    <FlatList
                        key={'grid-2-columns'} // Fixed key to force grid rendering
                        data={displayedProducts}
                        numColumns={2} // IMPORTANT: Display 2 columns
                        keyExtractor={(item) => (item.id as number).toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper} // Style for horizontal row
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Chưa có sản phẩm nào</Text>
                        }
                    />
                </View>
            </View>
            <AppFooter activeScreen="AddProduct" />
        </View>
    );
}

const styles = StyleSheet.create({
    // Form Styles Compact
    formContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3,
        zIndex: 10
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
    compactForm: { gap: 8 },
    rowInput: { flexDirection: 'row', gap: 8 },
    input: {
        height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        paddingHorizontal: 10, backgroundColor: '#fafafa', fontSize: 13
    },
    compactImgBtn: {
        width: 80, height: 40, backgroundColor: '#e9ecef', borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd'
    },
    submitButton: {
        backgroundColor: '#28a745', borderRadius: 8, height: 40,
        justifyContent: 'center', alignItems: 'center', marginTop: 4
    },
    submitButtonText: { color: '#fff', fontWeight: 'bold' },

    // List Styles
    listSection: { flex: 1, backgroundColor: '#f2f2f2' },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', margin: 12, paddingHorizontal: 12, height: 40,
        borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0'
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    columnWrapper: { justifyContent: 'space-between' }, // Align both sides evenly

    // GRID ITEM STYLES (Card UI)
    gridCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
        overflow: 'hidden',
    },
    imageContainer: { position: 'relative' },
    gridImage: {
        width: '100%',
        height: COLUMN_WIDTH, // Square image
        resizeMode: 'cover',
    },
    priceTag: {
        position: 'absolute', bottom: 8, right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4
    },
    priceText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    gridInfo: { padding: 8 },
    gridName: { fontSize: 13, fontWeight: '600', color: '#333', height: 36, marginBottom: 4 }, // Limit name height

    gridActions: {
        flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0',
        paddingTop: 6, justifyContent: 'space-between', alignItems: 'center'
    },
    actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    actionText: { fontSize: 12, fontWeight: '600' },
    divider: { width: 1, height: '100%', backgroundColor: '#f0f0f0' }
});

export default Sanpham3Sqlite;