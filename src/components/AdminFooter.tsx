import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
    [key: string]: any;
};

interface AdminNavItemProps {
    label: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    isActive: boolean;
    screen: string;
}

const adminNavItemsData: { label: string; iconName: keyof typeof MaterialIcons.glyphMap; screen: string }[] = [
    { label: "Dashboard", iconName: "dashboard", screen: "Admin" },
    { label: "Sản phẩm", iconName: "inventory", screen: "ProductManagement" },
    { label: "Danh mục", iconName: "folder", screen: "CategoryManagement" },
    { label: "Đơn hàng", iconName: "receipt", screen: "OrderManagement" },
    { label: "Người dùng", iconName: "people", screen: "UserManagement" },
];

function AdminNavItem({ label, iconName, isActive, screen }: AdminNavItemProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handlePress = () => {
        // If already on this screen, do nothing
        if (isActive) {
            return;
        }
        
        // Reset to tab screen to avoid stack accumulation
        navigation.reset({
            index: 0,
            routes: [{ name: screen }],
        });
    };

    return (
        <TouchableOpacity style={styles.navItem} onPress={handlePress}>
            <View style={styles.iconContainer}>
                <MaterialIcons 
                    name={iconName} 
                    size={22} 
                    color={isActive ? '#dc3545' : '#666'} 
                />
            </View>
            <Text style={[styles.navText, isActive && styles.activeText, isActive && { color: '#dc3545' }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function AdminFooter({ activeScreen }: { activeScreen: string }) {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.bottomNav}>
                {adminNavItemsData.map((item) => (
                    <AdminNavItem
                        key={item.label}
                        label={item.label}
                        iconName={item.iconName}
                        isActive={item.screen === activeScreen}
                        screen={item.screen}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNavContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 2,
        borderTopColor: '#dc3545',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 8,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginBottom: 4,
    },
    navText: {
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 11,
        color: '#666',
    },
    activeText: {
        fontWeight: 'bold',
    },
});
