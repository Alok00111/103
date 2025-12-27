import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useStore } from '../store/useStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Games
import ChargerChallenge from '../games/ChargerChallenge';
import MewingMaster from '../games/MewingMaster';
import SkibidiDodge from '../games/SkibidiDodge';

export type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    ChargerChallenge: undefined;
    MewingMaster: undefined;
    SkibidiDodge: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const { user, setUser, setLoading, isLoading } = useStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Show nothing while checking auth state
    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: '#0a0a0a' },
                }}
            >
                {user ? (
                    // Authenticated routes
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen
                            name="ChargerChallenge"
                            component={ChargerChallenge}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="MewingMaster"
                            component={MewingMaster}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="SkibidiDodge"
                            component={SkibidiDodge}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                    </>
                ) : (
                    // Unauthenticated routes
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
