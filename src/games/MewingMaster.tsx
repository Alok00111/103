import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import InterstitialAd from '../components/ads/InterstitialAd';
import { ArrowLeft, RotateCcw, Shield } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type GameState = 'waiting' | 'playing' | 'won' | 'lost';

export default function MewingMaster() {
    const navigation = useNavigation();
    const { isPremium, updateScore } = useStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [mouthOpen, setMouthOpen] = useState(false);
    const [strikes, setStrikes] = useState(0);
    const [showAd, setShowAd] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);

    const MAX_STRIKES = 3;

    // Simulate mouth detection for demo
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            // In real implementation, this would come from face detection
            // Simulating random mouth opens with 5% chance
            const shouldOpen = Math.random() < 0.05;
            setMouthOpen(shouldOpen);
        }, 500);

        return () => clearInterval(interval);
    }, [gameState]);

    // Check for mouth open violations
    useEffect(() => {
        if (gameState !== 'playing') return;

        if (mouthOpen) {
            setStrikes((prev) => {
                const newStrikes = prev + 1;
                if (newStrikes >= MAX_STRIKES) {
                    handleLose();
                }
                return newStrikes;
            });
            setCurrentStreak(0);
        } else {
            setCurrentStreak((prev) => prev + 1);
            setScore((prev) => prev + currentStreak); // Bonus for streaks
        }
    }, [mouthOpen, gameState]);

    // Timer & scoring
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setScore((prev) => prev + 10);
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleWin();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(60);
        setStrikes(0);
        setCurrentStreak(0);
        setMouthOpen(false);
    };

    const handleWin = () => {
        setGameState('won');
        updateScore('mewingMaster', score);
    };

    const handleLose = () => {
        setGameState('lost');
        updateScore('mewingMaster', score);
        if (!isPremium) {
            setShowAd(true);
        }
    };

    const resetGame = () => {
        setGameState('waiting');
        setScore(0);
        setTimeLeft(60);
        setStrikes(0);
        setCurrentStreak(0);
    };

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need camera access to track your mewing!</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front">
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.overlay}>
                    {/* HUD */}
                    <View style={styles.hud}>
                        <View style={styles.hudItem}>
                            <Text style={styles.hudLabel}>TIME</Text>
                            <Text style={[styles.hudValue, timeLeft <= 10 && styles.hudDanger]}>
                                {timeLeft}s
                            </Text>
                        </View>
                        <View style={styles.hudItem}>
                            <Text style={styles.hudLabel}>SCORE</Text>
                            <Text style={styles.hudValue}>{score}</Text>
                        </View>
                        <View style={styles.hudItem}>
                            <Text style={styles.hudLabel}>STRIKES</Text>
                            <Text style={styles.strikes}>
                                {'❌'.repeat(strikes)}{'⭕'.repeat(MAX_STRIKES - strikes)}
                            </Text>
                        </View>
                    </View>

                    {/* Game Display */}
                    <View style={styles.gameArea}>
                        {gameState === 'playing' && (
                            <>
                                {/* Mewing Status */}
                                <View style={[
                                    styles.statusCircle,
                                    mouthOpen ? styles.statusBad : styles.statusGood
                                ]}>
                                    <Text style={styles.statusEmoji}>
                                        {mouthOpen ? '😮' : '😤'}
                                    </Text>
                                </View>

                                <Text style={[
                                    styles.statusText,
                                    mouthOpen ? styles.textBad : styles.textGood
                                ]}>
                                    {mouthOpen ? 'MOUTH OPEN! 💀' : 'STAY LOCKED IN 🔒'}
                                </Text>

                                {/* Streak counter */}
                                {currentStreak > 5 && !mouthOpen && (
                                    <View style={styles.streakBadge}>
                                        <Text style={styles.streakText}>🔥 {currentStreak} STREAK!</Text>
                                    </View>
                                )}

                                {/* Instructions */}
                                <Text style={styles.instruction}>
                                    Keep your mouth CLOSED and jaw TIGHT
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Game State Overlays */}
                    {gameState === 'waiting' && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.gameTitle}>😤 MEWING MASTER</Text>
                            <Text style={styles.gameInstructions}>
                                Keep your mouth CLOSED for 60 seconds!{'\n\n'}
                                Open your mouth = Strike{'\n'}
                                3 strikes = Game Over
                            </Text>
                            <TouchableOpacity style={styles.startButton} onPress={startGame}>
                                <Shield size={24} color="#000" />
                                <Text style={styles.startButtonText}>START MEWING</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'won' && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.winEmoji}>🗿</Text>
                            <Text style={styles.winTitle}>CHAD ACHIEVED!</Text>
                            <Text style={styles.finalScore}>Score: {score}</Text>
                            <Text style={styles.subtext}>Maximum jaw gains unlocked</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                <RotateCcw size={20} color="#000" />
                                <Text style={styles.retryButtonText}>Mew Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'lost' && !showAd && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.loseEmoji}>🤡</Text>
                            <Text style={styles.loseTitle}>NOT SIGMA</Text>
                            <Text style={styles.finalScore}>Score: {score}</Text>
                            <Text style={styles.subtext}>You opened your mouth too much</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                <RotateCcw size={20} color="#000" />
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </CameraView>

            <InterstitialAd visible={showAd} onClose={() => setShowAd(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    hud: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    hudItem: {
        alignItems: 'center',
    },
    hudLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    hudValue: {
        fontSize: 28,
        color: '#FF69B4',
        fontWeight: '900',
    },
    hudDanger: {
        color: '#FF4444',
    },
    strikes: {
        fontSize: 20,
        marginTop: 4,
    },
    gameArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 6,
    },
    statusGood: {
        backgroundColor: 'rgba(57, 255, 20, 0.2)',
        borderColor: '#39FF14',
    },
    statusBad: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)',
        borderColor: '#FF4444',
    },
    statusEmoji: {
        fontSize: 80,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: 20,
    },
    textGood: {
        color: '#39FF14',
    },
    textBad: {
        color: '#FF4444',
    },
    streakBadge: {
        marginTop: 20,
        backgroundColor: 'rgba(255, 165, 0, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFA500',
    },
    streakText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFA500',
    },
    instruction: {
        position: 'absolute',
        bottom: 100,
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    stateOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    gameTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FF69B4',
        marginBottom: 20,
        textAlign: 'center',
    },
    gameInstructions: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 28,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FF69B4',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 15,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
    },
    winEmoji: {
        fontSize: 100,
        marginBottom: 20,
    },
    winTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#39FF14',
        marginBottom: 10,
    },
    loseEmoji: {
        fontSize: 100,
        marginBottom: 20,
    },
    loseTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FF4444',
        marginBottom: 10,
    },
    finalScore: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
        color: '#888',
        marginBottom: 30,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FF69B4',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    permissionText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    permissionButton: {
        backgroundColor: '#FF69B4',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});
