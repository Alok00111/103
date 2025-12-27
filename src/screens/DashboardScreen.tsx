import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useStore } from '../store/useStore';
import GameCard from '../components/GameCard';
import BannerAd from '../components/ads/BannerAd';
import PremiumModal from '../components/store/PremiumModal';
import { LogOut, Crown, Zap } from 'lucide-react-native';

type RootStackParamList = {
    Dashboard: undefined;
    ChargerChallenge: undefined;
    MewingMaster: undefined;
    SkibidiDodge: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const games = [
    {
        id: 'ChargerChallenge',
        title: 'The Charger Challenge',
        emoji: '🔌',
        description: 'Tilt your head to plug in the charger!',
        color: '#39FF14',
        unlocked: true,
    },
    {
        id: 'MewingMaster',
        title: 'Mewing Master',
        emoji: '😤',
        description: 'Keep your mouth SHUT. Stay sigma.',
        color: '#FF69B4',
        unlocked: true,
    },
    {
        id: 'SkibidiDodge',
        title: 'Skibidi Dodge',
        emoji: '🚽',
        description: 'Dodge the falling chaos!',
        color: '#00BFFF',
        unlocked: true,
    },
];

export default function DashboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, isPremium, gameScores, logout } = useStore();
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            logout();
        } catch (error) {
            console.error('Logout error:', error);
            logout(); // Still logout locally
        }
    };

    const handleGamePress = (gameId: string) => {
        navigation.navigate(gameId as keyof RootStackParamList);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.displayName?.charAt(0) || '?'}
                            </Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.greeting}>Yo, {user?.displayName || 'Sigma'}!</Text>
                        <Text style={styles.subtitle}>
                            {isPremium ? '👑 Premium Sigma' : 'Free tier (womp womp)'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={24} color="#FF69B4" />
                </TouchableOpacity>
            </View>

            {/* Premium Banner */}
            {!isPremium && (
                <TouchableOpacity
                    style={styles.premiumBanner}
                    onPress={() => setShowPremiumModal(true)}
                >
                    <Crown size={24} color="#FFD700" />
                    <Text style={styles.premiumBannerText}>GO PREMIUM - No ads, full sigma!</Text>
                    <Zap size={20} color="#39FF14" />
                </TouchableOpacity>
            )}

            {/* Games List */}
            <ScrollView style={styles.gamesList} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>🎮 GAMES (Locked In)</Text>

                {games.map((game) => (
                    <GameCard
                        key={game.id}
                        title={game.title}
                        emoji={game.emoji}
                        description={game.description}
                        color={game.color}
                        unlocked={game.unlocked}
                        highScore={gameScores[game.id.charAt(0).toLowerCase() + game.id.slice(1) as keyof typeof gameScores]}
                        onPress={() => handleGamePress(game.id)}
                    />
                ))}

                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>🔒 More games coming soon, no cap</Text>
                </View>
            </ScrollView>

            {/* Banner Ad */}
            {!isPremium && <BannerAd />}

            {/* Premium Modal */}
            <PremiumModal
                visible={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 2,
        borderBottomColor: '#39FF14',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#39FF14',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#39FF14',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
    },
    logoutButton: {
        padding: 10,
    },
    premiumBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#2a2a2a',
        padding: 15,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    premiumBannerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFD700',
    },
    gamesList: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#39FF14',
        marginBottom: 20,
    },
    comingSoon: {
        alignItems: 'center',
        padding: 30,
        marginTop: 10,
    },
    comingSoonText: {
        fontSize: 16,
        color: '#666',
    },
});
