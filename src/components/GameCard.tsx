import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Trophy, Lock } from 'lucide-react-native';

interface GameCardProps {
    title: string;
    emoji: string;
    description: string;
    color: string;
    unlocked: boolean;
    highScore?: number;
    onPress: () => void;
}

export default function GameCard({
    title,
    emoji,
    description,
    color,
    unlocked,
    highScore = 0,
    onPress,
}: GameCardProps) {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                { borderColor: unlocked ? color : '#444' },
                !unlocked && styles.cardLocked,
            ]}
            onPress={onPress}
            disabled={!unlocked}
            activeOpacity={0.8}
        >
            <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: unlocked ? color : '#666' }]}>
                    {title}
                </Text>
                <Text style={styles.description}>{description}</Text>

                {highScore > 0 && (
                    <View style={styles.scoreContainer}>
                        <Trophy size={14} color="#FFD700" />
                        <Text style={styles.scoreText}>Best: {highScore}</Text>
                    </View>
                )}
            </View>

            <View style={styles.iconContainer}>
                {unlocked ? (
                    <ChevronRight size={28} color={color} />
                ) : (
                    <Lock size={24} color="#666" />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
    },
    cardLocked: {
        opacity: 0.5,
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 32,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#888',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    scoreText: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: '600',
    },
    iconContainer: {
        marginLeft: 10,
    },
});
