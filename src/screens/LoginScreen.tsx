import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useStore } from '../store/useStore';
import { Zap } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const setUser = useStore((state) => state.setUser);

    const [request, response, promptAsync] = Google.useAuthRequest({
        // Replace with your Google OAuth client IDs
        // Get these from Google Cloud Console -> APIs & Services -> Credentials
        clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        // For native builds, also set these in app.json under expo.extra
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleFirebaseSignIn(id_token);
        }
    }, [response]);

    const handleFirebaseSignIn = async (idToken: string) => {
        try {
            setLoading(true);
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            setUser({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            });
        } catch (error) {
            console.error('Firebase sign in error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock login for development (bypasses Google OAuth)
    const handleMockLogin = () => {
        setUser({
            uid: 'mock-user-123',
            displayName: 'Skibidi Sigma',
            email: 'sigma@brainrot.gg',
            photoURL: null,
        });
    };

    return (
        <View style={styles.container}>
            {/* Background Effects */}
            <View style={styles.glowCircle1} />
            <View style={styles.glowCircle2} />

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Zap size={80} color="#39FF14" strokeWidth={3} />
                <Text style={styles.title}>BRAINROT</Text>
                <Text style={styles.subtitle}>ARCADE</Text>
            </View>

            {/* Tagline */}
            <Text style={styles.tagline}>Lock in. Get yassified. 🔥</Text>

            {/* Login Button */}
            <TouchableOpacity
                style={styles.googleButton}
                onPress={() => promptAsync()}
                disabled={!request || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <>
                        <Image
                            source={{ uri: 'https://www.google.com/favicon.ico' }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Dev Mode Button */}
            <TouchableOpacity style={styles.devButton} onPress={handleMockLogin}>
                <Text style={styles.devButtonText}>🧪 Dev Mode (Skip Login)</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footer}>No cap, this app is bussin fr fr</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    glowCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#39FF14',
        opacity: 0.1,
        top: -100,
        left: -100,
    },
    glowCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#FF69B4',
        opacity: 0.1,
        bottom: -80,
        right: -80,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#39FF14',
        textShadowColor: '#39FF14',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FF69B4',
        marginTop: -5,
    },
    tagline: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 40,
        opacity: 0.8,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        maxWidth: 300,
        marginBottom: 16,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    devButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FF69B4',
        borderStyle: 'dashed',
    },
    devButtonText: {
        fontSize: 14,
        color: '#FF69B4',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        fontSize: 14,
        color: '#666',
    },
});
