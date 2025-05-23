import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IconSymbol } from "@/components/ui/IconSymbol";

export function Disclaimer() {
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const colorScheme = useColorScheme();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowCloseButton(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={48}
                        color="#FF0000"
                        style={styles.warningIcon}
                    />
                    <ThemedText style={styles.text}>
                        THIS APP IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE.{'\n\n'}
                        THIS APP WAS DEVELOPED BY HIGH SCHOOL STUDENTS FOR A HACKATHON PROJECT IN TWO MONTHS.{'\n\n'}
                        **WE ARE NOT MEDICAL PROFESSIONALS.**{'\n\n'}
                        USE ANY CLASSIFICATIONS AS A SMALL STEP TOWARDS ACTUAL PROFESSIONAL MEDICAL ADVICE.
                    </ThemedText>
                    {showCloseButton && (
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => setIsVisible(false)}
                        >
                            <Text style={styles.buttonText}>I Understand</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#424242',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    warningIcon: {
        marginBottom: 16,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: '#FF0000',
        fontWeight: '600',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#FF0000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});