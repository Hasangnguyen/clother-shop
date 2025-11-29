import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Product } from '../models/Product';
import { ProductRepository } from '../services/ProductRepository';
import { PrimaryButton } from '../../../components';
import { useCart } from '../../../context/CartContext';

export default function ProductDetailScreen() {
    const route = useRoute<RouteProp<any>>();
    const [product, setProduct] = useState<Product | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        ProductRepository.getById(route.params?.id).then(setProduct);
    }, []);

    if (!product) return null;

    return (
        <View style={{ padding: 16 }}>
            <Image source={{ uri: product.image }} style={{ height: 200, width: 200 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{product.title}</Text>
            <Text>{product.description}</Text>
            <Text style={{ marginVertical: 10, fontWeight: 'bold' }}>${product.price}</Text>
            <PrimaryButton title="Add to Cart" onPress={() => addToCart(product)} />
        </View>
    );
}
