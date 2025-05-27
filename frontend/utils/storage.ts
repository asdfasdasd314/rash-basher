import { Classification } from '@/types/classification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export async function saveClassification (imagePath: string | null, classification: string, confidence: number) {
    let classifications: Classification[] = [];

    if (Platform.OS === 'web') {
        // Retrieve from local storage
        const classificationsStr = localStorage.getItem('classifications');
        if (classificationsStr) {
            classifications = JSON.parse(classificationsStr);
        }
    }
    else {
        // Retrieve from async storage
        const classificationsStr = await AsyncStorage.getItem('classifications');
        if (classificationsStr) {
            classifications = JSON.parse(classificationsStr);
        }
    }

    classifications.push({
        timestamp: new Date(),
        imagePath,
        classification,
        confidence,
    });

    if (Platform.OS === 'web') {
        localStorage.setItem('classifications', JSON.stringify(classifications));
    }
    else {
        await AsyncStorage.setItem('classifications', JSON.stringify(classifications));
    }
}

export async function getClassificationHistory () {
    let classifications: Classification[] = [];

    if (Platform.OS === 'web') {
        const classificationsStr = localStorage.getItem('classifications');
        if (classificationsStr) {
            classifications = JSON.parse(classificationsStr);
        }
    }
    else {
        const classificationsStr = await AsyncStorage.getItem('classifications');
        if (classificationsStr) {
            classifications = JSON.parse(classificationsStr);
        }
    }

    return classifications;
}

export async function clearClassificationHistory () {
    if (Platform.OS === 'web') {
        localStorage.removeItem('classifications');
    }
    else {
        await AsyncStorage.removeItem('classifications');
    }
}