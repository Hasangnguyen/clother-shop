import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Category } from '../database/database'; // Adjust path if needed

interface CategorySelectorProps {
    categories: Category[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, selectedId, onSelect }) => {
    const allCategories = [{ id: null as any, name: 'Tất cả' }, ...categories];

    return (
        <View style={styles.dropdownContainer}>
            <FlatList
                data={allCategories}
                keyExtractor={(item) => item.id?.toString() || 'all'}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.dropdownItem,
                            selectedId === item.id && styles.selectedDropdownItem,
                        ]}
                        onPress={() => onSelect(item.id)}
                    >
                        <Text
                            style={[
                                styles.dropdownText,
                                selectedId === item.id && styles.selectedDropdownText,
                            ]}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    categoryButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
    },
    selectedCategoryButton: {
        backgroundColor: '#ff69b4',
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: 200,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedDropdownItem: {
        backgroundColor: '#e6f7ff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDropdownText: {
        color: '#ff69b4',
        fontWeight: 'bold',
    },
});

export default CategorySelector;
