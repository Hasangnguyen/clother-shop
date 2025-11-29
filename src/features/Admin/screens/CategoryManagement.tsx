import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import { fetchCategories, addCategory, deleteCategory, updateCategory, Category } from '../../../database/database';

type AdminStackParamList = {
    AdminDashboard: undefined;
    ProductManagement: undefined;
    AddProduct: { categoryId?: number };
    EditProduct: { productId: number };
    UserManagement: undefined;
    CategoryManagement: undefined;
};

type CategoryManagementNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'CategoryManagement'>;

export default function CategoryManagement() {
    const navigation = useNavigation<CategoryManagementNavigationProp>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIconUri, setNewCategoryIconUri] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const fetchedCategories = await fetchCategories();
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Lỗi', 'Không thể tải danh mục');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }

        try {
            if (editingCategoryId !== null) {
                // Update existing
                await updateCategory({ id: editingCategoryId, name: newCategoryName.trim(), iconUri: newCategoryIconUri.trim() || undefined });
                Alert.alert('Thành công', 'Đã cập nhật danh mục');
            } else {
                await addCategory({
                    name: newCategoryName.trim(),
                    iconUri: newCategoryIconUri.trim() || undefined,
                });
                Alert.alert('Thành công', 'Đã thêm danh mục mới');
            }
            // Reset form
            setNewCategoryName('');
            setNewCategoryIconUri('');
            setIsAddingCategory(false);
            setEditingCategoryId(null);
            loadCategories(); // Reload categories
        } catch (error) {
            console.error('Error adding category:', error);
            Alert.alert('Lỗi', 'Không thể thêm danh mục');
        }
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategoryId(category.id);
        setNewCategoryName(category.name);
        setNewCategoryIconUri(category.iconUri ?? '');
        setIsAddingCategory(true);
    };

    const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa danh mục "${categoryName}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategory(categoryId);
                            Alert.alert('Thành công', 'Đã xóa danh mục');
                            loadCategories(); // Reload categories
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            Alert.alert('Lỗi', 'Không thể xóa danh mục');
                        }
                    }
                }
            ]
        );
    };

    const renderCategory = ({ item }: { item: Category }) => (
        <View style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
                {item.iconUri ? (
                    <Image source={{ uri: item.iconUri }} style={styles.categoryIcon} />
                ) : null}
                <Text style={styles.categoryName}>{item.name}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.addProductButton}
                    onPress={() => navigation.navigate('AddProduct', { categoryId: item.id })}
                >
                    <Text style={styles.addProductText}>Thêm SP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditCategory(item)}
                >
                    <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCategory(item.id, item.name)}
                >
                    <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader />

            <View style={styles.content}>
                <Text style={styles.title}>Quản Lý Danh Mục</Text>
                <Text style={styles.subtitle}>Tổng số: {categories.length} danh mục</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAddingCategory(!isAddingCategory)}
                >
                    <Text style={styles.addButtonText}>
                        {isAddingCategory ? 'Hủy Thêm' : '+ Thêm Danh Mục'}
                    </Text>
                </TouchableOpacity>

                {isAddingCategory && (
                    <View style={styles.addForm}>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên danh mục"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="URL icon danh mục"
                            value={newCategoryIconUri}
                            onChangeText={setNewCategoryIconUri}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddCategory}
                        >
                            <Text style={styles.submitButtonText}>Thêm Danh Mục</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCategory}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <AppFooter activeScreen="CategoryManagement" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    content: { flex: 1, padding: 20 },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center'
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
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
    listContainer: { paddingBottom: 20 },
    categoryItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryInfo: { flex: 1 },
    categoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    categoryDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    },
    createdAt: {
        fontSize: 12,
        color: '#999'
    },
    actions: { flexDirection: 'row', gap: 10 },
    addProductButton: {
        backgroundColor: '#ffc107',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
    },
    addProductText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold'
    },
    editButton: {
        backgroundColor: '#17a2b8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5,
        marginLeft: 8,
    },
    editText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    deleteText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
});
