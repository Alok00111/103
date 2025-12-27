import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import InterstitialAd from '../components/ads/InterstitialAd';
import { ArrowLeft, Zap, RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameState = 'waiting' | 'playing' | 'won' | 'lost';

export default function ChargerChallenge() {
    const navigation = useNavigation();
    const { isPremium, updateScore } = useStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [headPosition, setHeadPosition] = useState(0); // -1 to 1 (left to right)
    const [alignmentProgress, setAlignmentProgress] = useState(0);
    const [showAd, setShowAd] = useState(false);

    const cablePosition = useRef(new Animated.Value(0)).current;
    const targetPosition = useRef(0.3); // Random target position

    // Simulate head tracking with random movement for demo
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            // In real implementation, this would come from face detection
            // For demo, we simulate based on device motion or random
            setHeadPosition((prev) => {
                const delta = (Math.random() - 0.5) * 0.2;
                return Math.max(-1, Math.min(1, prev + delta));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState]);

    // Check alignment
    useEffect(() => {
        if (gameState !== 'playing') return;

        const distance = Math.abs(headPosition - targetPosition.current);
        const isAligned = distance < 0.15;

        if (isAligned) {
            setAlignmentProgress((prev) => {
                const newProgress = Math.min(100, prev + 5);
                if (newProgress >= 100) {
                    handleWin();
                }
                return newProgress;
            });
            setScore((prev) => prev + 10);
        } else {
            setAlignmentProgress((prev) => Math.max(0, prev - 2));
        }
    }, [headPosition, gameState]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleLose();
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
        setTimeLeft(30);
        setAlignmentProgress(0);
        targetPosition.current = (Math.random() - 0.5) * 1.5;
    };

    const handleWin = () => {
        setGameState('won');
        updateScore('chargerChallenge', score);
    };

    const handleLose = () => {
        setGameState('lost');
        updateScore('chargerChallenge', score);
        if (!isPremium) {
            setShowAd(true);
        }
    };

    const resetGame = () => {
        setGameState('waiting');
        setScore(0);
        setTimeLeft(30);
        setAlignmentProgress(0);
    };

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need camera access to track your face!</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera Background */}
            <CameraView style={styles.camera} facing="front">
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>

                {/* Game UI Overlay */}
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
                    </View>

                    {/* Charger Cable Visual */}
                    <View style={styles.gameArea}>
                        {/* Cable coming from top */}
                        <View style={[
                            styles.cable,
                            { left: `${50 + targetPosition.current * 30}%` }
                        ]}>
                            <Text style={styles.cableEmoji}>🔌</Text>
                            <View style={styles.cableWire} />
                        </View>

                        {/* Phone port (follows head) */}
                        <View style={[
                            styles.phonePort,
                            { left: `${50 + headPosition * 30}%` }
                        ]}>
                            <Text style={styles.portEmoji}>📱</Text>
                            <View style={styles.portHole} />
                        </View>

                        {/* Alignment Indicator */}
                        <View style={styles.alignmentContainer}>
                            <View style={styles.alignmentBar}>
                                <View
                                    style={[
                                        styles.alignmentFill,
                                        { width: `${alignmentProgress}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.alignmentText}>
                                {alignmentProgress >= 100 ? '⚡ CHARGED!' : 'Align to charge!'}
                            </Text>
                        </View>
                    </View>

                    {/* Game State Overlays */}
                    {gameState === 'waiting' && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.gameTitle}>🔌 CHARGER CHALLENGE</Text>
                            <Text style={styles.gameInstructions}>
                                Tilt your head to align the charger with your phone!
                            </Text>
                            <TouchableOpacity style={styles.startButton} onPress={startGame}>
                                <Zap size={24} color="#000" />
                                <Text style={styles.startButtonText}>START GAME</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'won' && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.winEmoji}>✨</Text>
                            <Text style={styles.winTitle}>YASSIFIED! 💅</Text>
                            <Text style={styles.finalScore}>Score: {score}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                <RotateCcw size={20} color="#000" />
                                <Text style={styles.retryButtonText}>Play Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'lost' && !showAd && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.loseEmoji}>💀</Text>
                            <Text style={styles.loseTitle}>WOMP WOMP</Text>
                            <Text style={styles.finalScore}>Score: {score}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                <RotateCcw size={20} color="#000" />
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </CameraView>

            {/* Interstitial Ad */}
            <InterstitialAd
                visible={showAd}
                onClose={() => setShowAd(false)}
            />
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
        paddingHorizontal: 40,
    },
    hudItem: {
        alignItems: 'center',
    },
    hudLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    hudValue: {
        fontSize: 32,
        color: '#39FF14',
        fontWeight: '900',
    },
    hudDanger: {
        color: '#FF4444',
    },
    gameArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cable: {
        position: 'absolute',
        top: 50,
        alignItems: 'center',
    },
    cableEmoji: {
        fontSize: 50,
    },
    cableWire: {
        width: 6,
        height: 150,
        backgroundColor: '#39FF14',
        borderRadius: 3,
    },
    phonePort: {
        position: 'absolute',
        bottom: 200,
        alignItems: 'center',
    },
    portEmoji: {
        fontSize: 60,
    },
    portHole: {
        width: 30,
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        marginTop: -15,
    },
    alignmentContainer: {
        position: 'absolute',
        bottom: 100,
        width: '80%',
        alignItems: 'center',
    },
    alignmentBar: {
        width: '100%',
        height: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
    },
    alignmentFill: {
        height: '100%',
        backgroundColor: '#39FF14',
        borderRadius: 10,
    },
    alignmentText: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
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
        color: '#39FF14',
        marginBottom: 20,
        textAlign: 'center',
    },
    gameInstructions: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 26,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#39FF14',
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
        fontSize: 80,
        marginBottom: 20,
    },
    winTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FF69B4',
        marginBottom: 20,
    },
    loseEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    loseTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FF4444',
        marginBottom: 20,
    },
    finalScore: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 30,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#39FF14',
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
        backgroundColor: '#39FF14',
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
