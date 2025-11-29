import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
            <View style={styles.userContainer}>
                <Text style={styles.heading}>Chào mừng, {user}!</Text>
                <Text style={styles.roleText}>
                    {isAdmin ? 'Bạn là quản trị viên' : 'Bạn là người dùng thông thường'}
                </Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Admin')}>
                        <Text style={styles.adminButtonText}>Vào Bảng Điều Khiển Admin</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.orderHistoryButton} onPress={() => navigation.navigate('OrderHistory')}>
                    <Text style={styles.orderHistoryText}>📋 Xem Lịch Sử Đơn Hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.aboutButton} onPress={() => navigation.navigate('About')}>
                    <Text style={styles.aboutText}>ℹ️ Về Chúng Tôi</Text>
                </TouchableOpacity>

                <View style={styles.profileForm}>
                    <Text style={{ fontWeight: '600', marginBottom: 6 }}>Số điện thoại</Text>
                    <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

                    <Text style={{ fontWeight: '600', marginBottom: 6 }}>Mật khẩu mới</Text>
                    <TextInput value={newPassword} onChangeText={setNewPassword} style={styles.input} secureTextEntry />

                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
                        <Text style={styles.updateText}>{loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Đăng Xuất</Text>
                    </TouchableOpacity>
                </View>

            </View>
            <AppFooter activeScreen="User" />
        </View>
    );
}

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
    userContainer: {
        flex: 1,
        paddingHorizontal: 20,
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
    logoutButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
        width: '80%',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    roleText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 10,
    },
    adminButton: {
        backgroundColor: '#ff69b4',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    adminButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileForm: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
    },
    updateButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    updateText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    orderHistoryButton: {
        backgroundColor: '#ff69b4',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    orderHistoryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    aboutButton: {
        backgroundColor: '#17a2b8',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    aboutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
