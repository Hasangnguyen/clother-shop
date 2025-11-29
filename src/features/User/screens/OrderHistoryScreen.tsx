import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { fetchOrdersByUser, fetchOrderItems } from '../../../database/database';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';

interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    userId: number;
    total: number;
    status: string;
    address: string;
    createdAt: string;
}

export default function OrderHistoryScreen() {
    const { userId } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
    const [orderItemsMap, setOrderItemsMap] = useState<{ [key: number]: OrderItem[] }>({});

    useEffect(() => {
        const loadOrders = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const fetchedOrders = await fetchOrdersByUser(userId);
                setOrders(fetchedOrders);

                // Fetch order items for each order
                const itemsMap: { [key: number]: OrderItem[] } = {};
                for (const order of fetchedOrders) {
                    const items = await fetchOrderItems(order.id);
                    itemsMap[order.id] = items;
                }
                setOrderItemsMap(itemsMap);
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [userId]);

    const toggleExpand = (orderId: number) => {
        setExpandedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const isExpanded = expandedOrderIds.includes(item.id);
        const items = orderItemsMap[item.id] || [];

        return (
            <View style={styles.orderContainer}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                        <Text style={styles.orderTitle}>Đơn hàng #{item.id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#ffc107' : item.status === 'completed' ? '#28a745' : '#6c757d' }]}>
                            <Text style={styles.statusText}>{item.status === 'pending' ? '⏳ Chờ xử lý' : item.status === 'completed' ? '✅ Hoàn thành' : '❌ Đã hủy'}</Text>
                        </View>
                    </View>
                    <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>💰 Tổng tiền:</Text>
                        <Text style={styles.summaryValue}>{item.total.toLocaleString()}₫</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>📅 Ngày đặt:</Text>
                        <Text style={styles.summaryValue}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.orderDetails}>
                        <Text style={styles.sectionTitle}>📦 Chi tiết sản phẩm:</Text>
                        {items.length === 0 ? (
                            <Text style={styles.noItems}>Chưa có sản phẩm</Text>
                        ) : (
                            items.map((oi, idx) => (
                                <View key={oi.id} style={[styles.orderItem, idx < items.length - 1 && styles.orderItemBorder]}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemLabel}>Sản phẩm ID: <Text style={styles.itemValue}>{oi.productId}</Text></Text>
                                        <Text style={styles.itemLabel}>Số lượng: <Text style={styles.itemValue}>{oi.quantity}</Text></Text>
                                        <Text style={styles.itemLabel}>Đơn giá: <Text style={styles.itemValue}>{oi.price.toLocaleString()}₫</Text></Text>
                                    </View>
                                </View>
                            ))
                        )}
                        <View style={styles.addressSection}>
                            <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng:</Text>
                            <Text style={styles.addressText}>{item.address}</Text>
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
                    <ActivityIndicator size="large" />
                    <Text>Loading orders...</Text>
                </View>
                <AppFooter activeScreen="User" />
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.container}>
                <AppHeader />
                <View style={styles.emptyContainer}>
                    <Text>No orders found.</Text>
                </View>
                <AppFooter activeScreen="User" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader />
            <Text style={styles.header}>Lịch Sử Đơn Hàng</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
            <AppFooter activeScreen="User" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        color: '#333',
    },
    orderContainer: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    orderHeaderLeft: {
        flex: 1,
        flexDirection: 'column',
    },
    orderTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    expandIcon: {
        fontSize: 16,
        color: '#666',
        marginLeft: 12,
    },
    orderSummary: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    orderDetails: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    noItems: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    orderItem: {
        marginBottom: 12,
        paddingBottom: 12,
    },
    orderItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemInfo: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    itemLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    itemValue: {
        fontWeight: '600',
        color: '#333',
    },
    addressSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addressText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
