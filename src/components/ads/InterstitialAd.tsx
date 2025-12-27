import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

interface InterstitialAdProps {
    visible: boolean;
    onClose: () => void;
}

export default function InterstitialAd({ visible, onClose }: InterstitialAdProps) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (visible) {
            setCountdown(5);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.adLabel}>📺 ADVERTISEMENT</Text>

                    <View style={styles.adContent}>
                        <Text style={styles.adText}>🎮 Imagine no ads here...</Text>
                        <Text style={styles.adSubtext}>Go Premium for $4.99!</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.closeButton, countdown > 0 && styles.closeButtonDisabled]}
                        onPress={onClose}
                        disabled={countdown > 0}
                    >
                        <Text style={styles.closeButtonText}>
                            {countdown > 0 ? `Wait ${countdown}s...` : 'Close Ad ✕'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#444',
    },
    adLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 30,
    },
    adContent: {
        alignItems: 'center',
        marginBottom: 30,
    },
    adText: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 10,
    },
    adSubtext: {
        fontSize: 16,
        color: '#FF69B4',
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#39FF14',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    closeButtonDisabled: {
        backgroundColor: '#444',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});
