import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../features/Home/screens/HomeScreen';
import AboutScreen from '../features/Home/screens/AboutScreen';
import ExploreScreen from '../features/Explore/screens/ExploreScreen';
import ProductsByCategoryScreen from '../features/Explore/screens/ProductByCategory';
import ProductDetailScreen from '../features/Products/screens/ProductDetailScreen';
import ProductManagementScreen from '../features/Admin/screens/ProductManagement';
import CartScreen from '../features/Cart/screens/CartScreen';
import CheckoutScreen from '../features/Cart/screens/CheckoutScreen';
import AdminScreen from '../features/Admin/screens/AdminDashboard';
import UserManagementScreen from '../features/Admin/screens/UserManagement';
import CategoryManagementScreen from '../features/Admin/screens/CategoryManagement';
import OrderManagementScreen from '../features/Admin/screens/OrderManagement';
import UserScreen from '../features/User/screens/UserScreen';
import OrderHistoryScreen from '../features/User/screens/OrderHistoryScreen';
import LoginScreen from '../features/Auth/screens/LoginScreen';
import RegisterScreen from '../features/Auth/screens/RegisterScreen';
import { Product } from '../features/Products/models/Product';

export type RootStackParamList = {
    Home: undefined;
    Explore: undefined;
    ProductsByCategory: { categoryId: number; categoryName: string };
    ProductDetail: { product: Product };
    ProductManagement: undefined;
    Cart: undefined;
    Checkout: undefined;
    Admin: undefined;
    AddProduct: undefined;
    UserManagement: undefined;
    CategoryManagement: undefined;
    OrderManagement: undefined;
    User: undefined;
    OrderHistory: undefined;
    Login: undefined;
    Register: undefined;
    About: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator 
            initialRouteName="Home" 
            screenOptions={{ 
                headerShown: false,
                transitionSpec: {
                    open: { animation: 'timing', config: { duration: 0 } },
                    close: { animation: 'timing', config: { duration: 0 } },
                },
                cardStyleInterpolator: () => ({
                    cardStyle: {
                        opacity: 1,
                    },
                }),
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen name="ProductsByCategory" component={ProductsByCategoryScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
            <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
            <Stack.Screen name="User" component={UserScreen} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}
