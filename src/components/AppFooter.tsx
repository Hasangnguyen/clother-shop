import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AdminFooter from './AdminFooter';

// Assume RootStackParamList...
type RootStackParamList = {
    Home: undefined;
    Explore: undefined;
    Cart: undefined;
    User: undefined;
    About: undefined;
    [key: string]: any;
};


const navItemsData: { label: string; icon: string; screen: keyof RootStackParamList }[] = [
    { label: "Trang chủ", icon: "🏡", screen: "Home" },
    { label: "Khám Phá", icon: "✨", screen: "Explore" },
    { label: "Giỏ hàng", icon: "👜", screen: "Cart" },
    { label: "Cá nhân", icon: "👗", screen: "User" },
];

interface BottomNavItemProps {
    label: string;
    icon: string;
    isActive: boolean;
    screen: keyof RootStackParamList;
}

function BottomNavItem({ label, icon, isActive, screen }: BottomNavItemProps) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handlePress = () => {
        // If already on this tab screen, do nothing
        if (isActive) {
            return;
        }
        
        // Reset to tab screen to avoid stack accumulation
        // This works even when coming from non-tab screens like About
        navigation.reset({
            index: 0,
            routes: [{ name: screen as string }],
        });
    };

    return (
        <TouchableOpacity style={styles.navItem} onPress={handlePress}>
            <View style={styles.iconContainer}>
                <Text style={[styles.navIcon, isActive && { color: '#ff69b4' }]}>{icon}</Text>
            </View>
            <Text style={[styles.navText, isActive && { color: '#ff69b4' }]}>{label}</Text>
        </TouchableOpacity>
    );
}
export default function AppFooter({ activeScreen }: { activeScreen: keyof RootStackParamList }) {
    const { isAdmin } = useAuth();
    const insets = useSafeAreaInsets();

    // If user is admin, show AdminFooter instead
    if (isAdmin) {
        return <AdminFooter activeScreen={activeScreen as string} />;
    }

    // Otherwise show regular user footer
    return (
        <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.bottomNav}>
                {/* ... mapping navItemsData kept original ... */}
                {navItemsData.map((item) => (
                    <BottomNavItem
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
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
        marginBottom: 3,
    },
    navIcon: {
        fontSize: 18,
        fontWeight: 'normal',
    },
    navText: {
        fontWeight: 'normal',
        textAlign: 'center',
    },
});