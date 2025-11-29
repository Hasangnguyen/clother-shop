import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchAllOrders, fetchOrderItems, updateOrderStatus, OrderItem, OrderWithPhone } from '../../../database/database';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered', 'canceled'];

export default function OrderManagement() {
    const [orders, setOrders] = useState<OrderWithPhone[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
    const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItem[] }>({});
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const allOrders = await fetchAllOrders();
            setOrders(allOrders);
            const itemsMap: { [key: number]: OrderItem[] } = {};
            for (const order of allOrders) {
                const items = await fetchOrderItems(order.id);
                itemsMap[order.id] = items;
            }
            setOrderItemsMap(itemsMap);
        } catch (error) {
            console.error('Failed to load orders:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (orderId: number) => {
        setExpandedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const onChangeStatus = async (orderId: number, newStatus: string) => {
        setUpdatingStatusId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(prev =>
                prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
            );
            Alert.alert('Success', 'Order status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update order status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return { backgroundColor: '#FFF3CD', borderColor: '#FFC107', textColor: '#856404' };
            case 'shipped':
                return { backgroundColor: '#D1ECF1', borderColor: '#17A2B8', textColor: '#0C5460' };
            case 'delivered':
                return { backgroundColor: '#D4EDDA', borderColor: '#28A745', textColor: '#155724' };
            case 'canceled':
                return { backgroundColor: '#F8D7DA', borderColor: '#F5C6CB', textColor: '#721C24' };
            default:
                return { backgroundColor: '#E2E3E5', borderColor: '#D3D6DB', textColor: '#383D41' };
        }
    };

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'shipped':
                return '📦';
            case 'delivered':
                return '✅';
            case 'canceled':
                return '❌';
            default:
                return '❓';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý';
            case 'shipped':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            case 'canceled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const renderOrderItem = ({ item }: { item: OrderWithPhone }) => {
        const isExpanded = expandedOrderIds.includes(item.id);
        const items = orderItemsMap[item.id] || [];
        const statusStyle = getStatusBadgeStyle(item.status);
        const orderDate = new Date(item.createdAt);
        const formattedDate = orderDate.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <View style={styles.orderContainer}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.orderHeaderRow}>
                    <View style={styles.orderHeaderLeft}>
                        <Text style={styles.orderTitle}>Đơn hàng #{item.id}</Text>
                        <Text style={styles.orderDate}>{formattedDate}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.textColor }]}>
                            {getStatusEmoji(item.status)} {getStatusLabel(item.status)}
                        </Text>
                    </View>
                    <Text style={styles.expandIndicator}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>💰 Tổng cộng:</Text>
                        <Text style={styles.summaryValue}>{item.total.toLocaleString('vi-VN')}₫</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>📞 Số điện thoại:</Text>
                        <Text style={styles.phoneValue}>{item.phone || 'Không có'}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.orderDetails}>
                        <Text style={styles.sectionTitle}>📋 Chi tiết sản phẩm</Text>
                        {items.length === 0 ? (
                            <Text style={styles.noItems}>Không có sản phẩm</Text>
                        ) : (
                            items.map(oi => (
                                <View key={oi.id} style={styles.itemInfo}>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemLabel}>Sản phẩm ID:</Text>
                                        <Text style={styles.itemValue}>{oi.productId}</Text>
                                    </View>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemLabel}>Số lượng:</Text>
                                        <Text style={styles.itemValue}>{oi.quantity}</Text>
                                    </View>
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemLabel}>Giá:</Text>
                                        <Text style={styles.itemValue}>{oi.price.toLocaleString('vi-VN')}₫</Text>
                                    </View>
                                </View>
                            ))
                        )}

                        <Text style={styles.sectionTitle}>🏠 Địa chỉ giao hàng</Text>
                        <View style={styles.addressSection}>
                            <Text style={styles.addressText}>{item.address}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>📊 Cập nhật trạng thái</Text>
                        <View style={styles.statusContainer}>
                            {Platform.OS === 'android' ? (
                                <Picker
                                    selectedValue={item.status}
                                    style={styles.picker}
                                    enabled={updatingStatusId !== item.id}
                                    onValueChange={(value: string) => onChangeStatus(item.id, value)}
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <Picker.Item label={getStatusLabel(status)} value={status} key={status} />
                                    ))}
                                </Picker>
                            ) : (
                                <View style={styles.statusOptionsContainer}>
                                    {STATUS_OPTIONS.map(status => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusOption,
                                                item.status === status && styles.statusOptionSelected,
                                            ]}
                                            disabled={updatingStatusId === item.id}
                                            onPress={() => onChangeStatus(item.id, status)}
                                        >
                                            <Text style={[
                                                styles.statusOptionText,
                                                item.status === status && styles.statusOptionSelectedText,
                                            ]}>
                                                {getStatusEmoji(status)} {getStatusLabel(status)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {updatingStatusId === item.id && <ActivityIndicator size="small" color="#ff69b4" />}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AppHeader />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff69b4" />
                    <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
                </View>
                <AppFooter activeScreen="OrderManagement" />
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.container}>
                <AppHeader />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
                </View>
                <AppFooter activeScreen="OrderManagement" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader />
            <View style={styles.contentContainer}>
                <Text style={styles.pageTitle}>📊 Quản Lý Đơn Hàng</Text>
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
            <AppFooter activeScreen="OrderManagement" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f3f5',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    orderContainer: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    orderHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    orderHeaderLeft: {
        flex: 1,
    },
    orderTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    orderDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expandIndicator: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff69b4',
    },
    orderSummary: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 6,
        marginTop: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff69b4',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    phoneValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#28A745',
    },
    orderDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 8,
    },
    noItems: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    itemInfo: {
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#28A745',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    itemLabel: {
        fontSize: 13,
        color: '#666',
    },
    itemValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    addressSection: {
        backgroundColor: '#f0f8ff',
        padding: 10,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#17A2B8',
        marginBottom: 12,
    },
    addressText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
    statusContainer: {
        marginTop: 10,
    },
    statusOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    statusOptionText: {
        fontSize: 12,
        color: '#666',
    },
    statusOptionSelected: {
        backgroundColor: '#ff69b4',
        borderColor: '#ff69b4',
    },
    statusOptionSelectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
