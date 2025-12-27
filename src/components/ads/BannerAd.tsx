import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BannerAd() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>📢 ADVERTISEMENT</Text>
            <Text style={styles.subtext}>Go Premium to remove ads!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    subtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});
