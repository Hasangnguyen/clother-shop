import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
    [key: string]: any;
};

interface AdminNavItemProps {
    label: string;
    icon: string;
    isActive: boolean;
    screen: string;
}

const adminNavItemsData: { label: string; icon: string; screen: string }[] = [
    { label: "Dashboard", icon: "📊", screen: "Admin" },
    { label: "Sản phẩm", icon: "👕", screen: "ProductManagement" },
    { label: "Danh mục", icon: "📂", screen: "CategoryManagement" },
    { label: "Đơn hàng", icon: "📮", screen: "OrderManagement" },
    { label: "Người dùng", icon: "👥", screen: "UserManagement" },
];

function AdminNavItem({ label, icon, isActive, screen }: AdminNavItemProps) {
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
                <Text style={[styles.navIcon, isActive && { color: '#dc3545' }]}>{icon}</Text>
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
                        icon={item.icon}
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
    navIcon: {
        fontSize: 20,
        fontWeight: 'normal',
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
