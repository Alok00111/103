import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { Crown, Sparkles, X, Check } from 'lucide-react-native';

interface PremiumModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function PremiumModal({ visible, onClose }: PremiumModalProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const setPremium = useStore((state) => state.setPremium);

    const handlePurchase = async () => {
        setLoading(true);

        // Mock payment process - 2 second delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setLoading(false);
        setSuccess(true);
        setPremium(true);

        // Close after showing success
        setTimeout(() => {
            setSuccess(false);
            onClose();
        }, 1500);
    };

    const benefits = [
        '🚫 No banner ads',
        '🚫 No interstitial ads',
        '👑 Premium badge',
        '🔓 Unlock future games first',
        '💪 Maximum sigma energy',
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <X size={24} color="#888" />
                    </TouchableOpacity>

                    {success ? (
                        <View style={styles.successContainer}>
                            <View style={styles.successIcon}>
                                <Check size={60} color="#39FF14" />
                            </View>
                            <Text style={styles.successTitle}>YOOO LET'S GO! 🎉</Text>
                            <Text style={styles.successSubtitle}>You're now a Premium Sigma!</Text>
                        </View>
                    ) : (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <Crown size={50} color="#FFD700" />
                                <Text style={styles.title}>GO PREMIUM</Text>
                                <Text style={styles.subtitle}>Unlock your full sigma potential</Text>
                            </View>

                            {/* Benefits */}
                            <View style={styles.benefits}>
                                {benefits.map((benefit, index) => (
                                    <View key={index} style={styles.benefitRow}>
                                        <Sparkles size={16} color="#39FF14" />
                                        <Text style={styles.benefitText}>{benefit}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Price */}
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>$4.99</Text>
                                <Text style={styles.priceSub}>One-time payment (fr fr)</Text>
                            </View>

                            {/* Purchase Button */}
                            <TouchableOpacity
                                style={styles.purchaseButton}
                                onPress={handlePurchase}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.purchaseButtonText}>BUY NOW - No cap 🔥</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>
                                This is a mock purchase for demo purposes
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        paddingBottom: 50,
        borderTopWidth: 3,
        borderColor: '#FFD700',
    },
    closeIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFD700',
        marginTop: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
    },
    benefits: {
        marginBottom: 25,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 16,
        color: '#fff',
    },
    priceContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    price: {
        fontSize: 48,
        fontWeight: '900',
        color: '#39FF14',
    },
    priceSub: {
        fontSize: 14,
        color: '#888',
    },
    purchaseButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    purchaseButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    disclaimer: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(57, 255, 20, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#39FF14',
        marginBottom: 10,
    },
    successSubtitle: {
        fontSize: 18,
        color: '#fff',
    },
});
