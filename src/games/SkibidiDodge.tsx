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
import { ArrowLeft, RotateCcw, Gamepad2 } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameState = 'waiting' | 'playing' | 'won' | 'lost';

interface FallingObject {
    id: number;
    emoji: string;
    x: number;
    y: Animated.Value;
    speed: number;
}

const EMOJIS = ['💀', '🔥', '💯', '🚽', '⚠️', '🗿', '👁️', '🧠'];
const PLAYER_WIDTH = 60;
const OBJECT_SIZE = 50;

export default function SkibidiDodge() {
    const navigation = useNavigation();
    const { isPremium, updateScore } = useStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2);
    const [objects, setObjects] = useState<FallingObject[]>([]);
    const [showAd, setShowAd] = useState(false);
    const [difficulty, setDifficulty] = useState(1);

    const objectIdRef = useRef(0);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    // Simulate head tracking for player movement
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            // Simulating head position - in real implementation this comes from face detection
            setPlayerX((prev) => {
                const delta = (Math.random() - 0.5) * 40;
                const newX = prev + delta;
                return Math.max(PLAYER_WIDTH, Math.min(SCREEN_WIDTH - PLAYER_WIDTH, newX));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState]);

    // Spawn falling objects
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnInterval = setInterval(() => {
            const newObject: FallingObject = {
                id: objectIdRef.current++,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                x: Math.random() * (SCREEN_WIDTH - OBJECT_SIZE),
                y: new Animated.Value(-OBJECT_SIZE),
                speed: 3000 - (difficulty * 200), // Faster as difficulty increases
            };

            setObjects((prev) => [...prev, newObject]);

            // Animate falling
            Animated.timing(newObject.y, {
                toValue: SCREEN_HEIGHT,
                duration: newObject.speed,
                useNativeDriver: true,
            }).start();
        }, Math.max(500, 1500 - (difficulty * 100))); // Spawn faster as difficulty increases

        return () => clearInterval(spawnInterval);
    }, [gameState, difficulty]);

    // Collision detection
    useEffect(() => {
        if (gameState !== 'playing') return;

        const collisionCheck = setInterval(() => {
            objects.forEach((obj) => {
                // Get current y position
                obj.y.addListener(({ value }) => {
                    const playerLeft = playerX - PLAYER_WIDTH / 2;
                    const playerRight = playerX + PLAYER_WIDTH / 2;
                    const playerTop = SCREEN_HEIGHT - 150;
                    const playerBottom = SCREEN_HEIGHT - 100;

                    const objLeft = obj.x;
                    const objRight = obj.x + OBJECT_SIZE;
                    const objTop = value;
                    const objBottom = value + OBJECT_SIZE;

                    // Check collision
                    if (
                        objRight > playerLeft &&
                        objLeft < playerRight &&
                        objBottom > playerTop &&
                        objTop < playerBottom
                    ) {
                        handleHit(obj.id);
                    }
                });
            });
        }, 50);

        return () => clearInterval(collisionCheck);
    }, [objects, playerX, gameState]);

    // Score and difficulty
    useEffect(() => {
        if (gameState !== 'playing') return;

        const scoreInterval = setInterval(() => {
            setScore((prev) => {
                const newScore = prev + 10;
                // Increase difficulty every 500 points
                if (newScore % 500 === 0) {
                    setDifficulty((d) => Math.min(10, d + 1));
                }
                return newScore;
            });
        }, 100);

        return () => clearInterval(scoreInterval);
    }, [gameState]);

    // Clean up off-screen objects
    useEffect(() => {
        if (gameState !== 'playing') return;

        const cleanup = setInterval(() => {
            setObjects((prev) => prev.filter((obj) => {
                // Remove objects that have passed the screen
                return true; // Would check y value in real implementation
            }));
        }, 1000);

        return () => clearInterval(cleanup);
    }, [gameState]);

    const handleHit = (objectId: number) => {
        setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
        setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                handleLose();
            }
            return newLives;
        });
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setObjects([]);
        setDifficulty(1);
        setPlayerX(SCREEN_WIDTH / 2);
        objectIdRef.current = 0;
    };

    const handleWin = () => {
        // No win condition - survival game
    };

    const handleLose = () => {
        setGameState('lost');
        updateScore('skibidiDodge', score);
        if (!isPremium) {
            setShowAd(true);
        }
    };

    const resetGame = () => {
        setGameState('waiting');
        setScore(0);
        setLives(3);
        setObjects([]);
        setDifficulty(1);
    };

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need camera access to track your head!</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing="front">
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
                            <Text style={styles.hudLabel}>LIVES</Text>
                            <Text style={styles.hearts}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</Text>
                        </View>
                        <View style={styles.hudItem}>
                            <Text style={styles.hudLabel}>SCORE</Text>
                            <Text style={styles.hudValue}>{score}</Text>
                        </View>
                        <View style={styles.hudItem}>
                            <Text style={styles.hudLabel}>LEVEL</Text>
                            <Text style={styles.hudValue}>{difficulty}</Text>
                        </View>
                    </View>

                    {/* Game Area */}
                    {gameState === 'playing' && (
                        <View style={styles.gameArea}>
                            {/* Falling Objects */}
                            {objects.map((obj) => (
                                <Animated.View
                                    key={obj.id}
                                    style={[
                                        styles.fallingObject,
                                        {
                                            left: obj.x,
                                            transform: [{ translateY: obj.y }],
                                        },
                                    ]}
                                >
                                    <Text style={styles.objectEmoji}>{obj.emoji}</Text>
                                </Animated.View>
                            ))}

                            {/* Player */}
                            <View style={[styles.player, { left: playerX - PLAYER_WIDTH / 2 }]}>
                                <Text style={styles.playerEmoji}>😎</Text>
                            </View>

                            {/* Instructions */}
                            <Text style={styles.instruction}>
                                Tilt your head left/right to dodge!
                            </Text>
                        </View>
                    )}

                    {/* Game States */}
                    {gameState === 'waiting' && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.gameTitle}>🚽 SKIBIDI DODGE</Text>
                            <Text style={styles.gameInstructions}>
                                Dodge the falling chaos!{'\n\n'}
                                Tilt your head left and right to move.{'\n'}
                                Don't get hit!
                            </Text>
                            <TouchableOpacity style={styles.startButton} onPress={startGame}>
                                <Gamepad2 size={24} color="#000" />
                                <Text style={styles.startButtonText}>LET'S GO</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {gameState === 'lost' && !showAd && (
                        <View style={styles.stateOverlay}>
                            <Text style={styles.loseEmoji}>💥</Text>
                            <Text style={styles.loseTitle}>SKILL ISSUE</Text>
                            <Text style={styles.finalScore}>Score: {score}</Text>
                            <Text style={styles.subtext}>Level reached: {difficulty}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                <RotateCcw size={20} color="#000" />
                                <Text style={styles.retryButtonText}>Run it Back</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        color: '#00BFFF',
        fontWeight: '900',
    },
    hearts: {
        fontSize: 20,
        marginTop: 4,
    },
    gameArea: {
        flex: 1,
        position: 'relative',
    },
    fallingObject: {
        position: 'absolute',
        width: OBJECT_SIZE,
        height: OBJECT_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    objectEmoji: {
        fontSize: 40,
    },
    player: {
        position: 'absolute',
        bottom: 100,
        width: PLAYER_WIDTH,
        height: PLAYER_WIDTH,
        borderRadius: PLAYER_WIDTH / 2,
        backgroundColor: 'rgba(0, 191, 255, 0.3)',
        borderWidth: 3,
        borderColor: '#00BFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerEmoji: {
        fontSize: 35,
    },
    instruction: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
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
        color: '#00BFFF',
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
        backgroundColor: '#00BFFF',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 15,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
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
        backgroundColor: '#00BFFF',
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
        backgroundColor: '#00BFFF',
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
