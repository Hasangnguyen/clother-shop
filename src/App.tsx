import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppNavigator from './navigation/AppNavigator';
import theme from './config/theme';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <CartProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
