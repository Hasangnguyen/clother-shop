import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../context/AuthContext';
import { getUserByUsername } from '../../../database/database';

import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

type RootStackParamList = {
    Home: undefined;
    Explore: undefined;
    Cart: undefined;
    Admin: undefined;
    User: undefined;
    Login: undefined;
    Register: undefined;
    OrderHistory: undefined;
    About: undefined;
};

export default function UserScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user, logout, isAdmin, updateProfile } = useAuth();
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const u = await getUserByUsername(user);
                if (u) setPhone(u.phone || '');
            } catch (e) {
                console.error('Load user info error', e);
            }
        };
        load();
    }, [user]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const success = await updateProfile({ password: newPassword || undefined, phone: phone || undefined });
            if (success) {
                Alert.alert('Thành công', 'Cập nhật thông tin thành công');
                setNewPassword('');
            } else {
                Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <AppHeader />
                <View style={styles.authContainer}>
                    <View style={styles.topRightLink}>
                        <TouchableOpacity onPress={() => navigation.navigate('About')}>
                            <Text style={styles.aboutLinkText}>Về Chúng Tôi</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heading}>Người Dùng</Text>
                    <Text style={styles.subHeading}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.buttonText}>Đăng Nhập</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.buttonTextSecondary}>Đăng Ký</Text>
                    </TouchableOpacity>
                </View>
                <AppFooter activeScreen="User" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Section with Gradient */}
                <LinearGradient
                    colors={['#ff69b4', '#ff8dc7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <MaterialIcons name="person" size={40} color="#ff69b4" />
                        </View>
                    </View>
                    <Text style={styles.welcomeText}>Chào mừng</Text>
                    <Text style={styles.usernameText}>{user}</Text>
                    <View style={styles.roleBadge}>
                        <MaterialIcons 
                            name={isAdmin ? "admin-panel-settings" : "person"} 
                            size={16} 
                            color="#fff" 
                        />
                        <Text style={styles.roleText}>
                            {isAdmin ? 'Quản trị viên' : 'Người dùng'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    {isAdmin && (
                        <TouchableOpacity 
                            style={styles.actionCard} 
                            onPress={() => navigation.navigate('Admin')}
                        >
                            <LinearGradient
                                colors={['#ff69b4', '#ff8dc7']}
                                style={styles.actionIconContainer}
                            >
                                <MaterialIcons name="dashboard" size={24} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.actionText}>Bảng Điều Khiển</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.actionCard} 
                        onPress={() => navigation.navigate('OrderHistory')}
                    >
                        <LinearGradient
                            colors={['#28a745', '#34ce57']}
                            style={styles.actionIconContainer}
                        >
                            <MaterialIcons name="receipt" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Lịch Sử Đơn Hàng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionCard} 
                        onPress={() => navigation.navigate('About')}
                    >
                        <LinearGradient
                            colors={['#17a2b8', '#20c9e7']}
                            style={styles.actionIconContainer}
                        >
                            <MaterialIcons name="info" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Về Chúng Tôi</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Form */}
                <View style={styles.profileForm}>
                    <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
                    
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <MaterialIcons name="phone" size={18} color="#ff69b4" />
                            <Text style={styles.label}>Số điện thoại</Text>
                        </View>
                        <TextInput 
                            value={phone} 
                            onChangeText={setPhone} 
                            style={styles.input} 
                            keyboardType="phone-pad"
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <MaterialIcons name="lock" size={18} color="#ff69b4" />
                            <Text style={styles.label}>Mật khẩu mới</Text>
                        </View>
                        <TextInput 
                            value={newPassword} 
                            onChangeText={setNewPassword} 
                            style={styles.input} 
                            secureTextEntry
                            placeholder="Nhập mật khẩu mới"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.updateButton} 
                        onPress={handleUpdate} 
                        disabled={loading}
                    >
                        <MaterialIcons name="save" size={20} color="#fff" />
                        <Text style={styles.updateText}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <MaterialIcons name="logout" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Đăng Xuất</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <AppFooter activeScreen="User" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    headerGradient: {
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
        marginBottom: 5,
    },
    usernameText: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    roleText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 8,
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    profileForm: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    updateButton: {
        backgroundColor: '#28a745',
        padding: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    updateText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        padding: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Auth screen styles (keep existing)
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
        paddingHorizontal: 15,
        color: '#ff69b4',
    },
    subHeading: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
        paddingHorizontal: 15,
        color: '#666',
    },
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'relative',
    },
    topRightLink: {
        position: 'absolute',
        top: 10,
        right: 20,
    },
    aboutLinkText: {
        color: '#17a2b8',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#ff69b4',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    buttonTextSecondary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
