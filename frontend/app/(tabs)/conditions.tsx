import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { openWebsite } from '@/utils/webNavigation';
import { useState } from 'react';

type Condition = {
    title: string;
    detection: string;
    effects?: string;
    citation: string;
    citationLink: string;
};

const conditions: Record<string, Condition> = {
    'actinic-keratosis': {
        title: 'Actinic Keratosis',
        detection: 'Nonpigmented facial actinic keratoses may exhibit a "strawberry pattern." This pattern includes an erythematous vessel pseudo network, prominent follicular openings, and a surrounding white halo.',
        citation: 'Marques E, Chen TM. Actinic Keratosis. [Updated 2023 Aug 17]. In: StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing; 2025 Jan-.',
        citationLink: 'https://www.mayoclinic.org/diseases-conditions/asthma/in-depth/asthma/art-20046857'
    },
    'basal-cell-carcinoma': {
        title: 'Basal Cell Carcinoma',
        detection: 'Basal cell carcinoma often appears as a slightly transparent bump on the skin, though it can take other forms. Basal cell carcinoma occurs most often on areas of the skin that are exposed to the sun, such as your head and neck.',
        citation: 'Mayo Clinic Staff. "Basal cell carcinoma." Mayo Clinic, 12 Apr 2025.',
        citationLink: 'https://www.mayoclinic.org/diseases-conditions/basal-cell-carcinoma/symptoms-causes/syc-20354187'
    },
    'benign-keratosis': {
        title: 'Benign Keratosis-like Lesions',
        detection: 'Seborrheic keratoses are usually round or oval and range in color from light tan to black. They can develop as a single growth or in clusters. Seborrheic keratoses are benign skin growths that resemble actinic keratoses.',
        effects: 'Seborrheic keratoses are harmless and not contagious. They don\'t need treatment, but you may decide to have them removed if they become irritated by clothing or you don\'t like how they look.',
        citation: 'Mayo Clinic Staff. "Seborrheic keratosis." Mayo Clinic, 18 Jan 2022.',
        citationLink: 'https://www.mayoclinic.org/diseases-conditions/seborrheic-keratosis/symptoms-causes/syc-20353878'
    },
    'dermatofibroma': {
        title: 'Dermatofibroma',
        detection: 'Dermatofibromas are slow-growing lesions that can develop on any part of the body, although they commonly affect the extremities. Clinically, they present as firm, nontender cutaneous nodules with or without accompanying skin changes, such as tan-pink to reddish-brown discoloration, which may vary depending on the age of the lesion. Typically, dermatofibromas measure 1 cm or less in diameter, but larger lesions exceeding 3 cm in diameter have been documented.',
        citation: 'Myers DJ, Fillman EP. Dermatofibroma. [Updated 2024 Feb 29]. In: StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing; 2025 Jan-.',
        citationLink: 'https://www.ncbi.nlm.nih.gov/books/NBK470538/'
    }
};

export default function ConditionsScreen() {
    const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#E6E6FA', dark: '#2D2D3D' }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="bandage.fill"
                        style={styles.infoRow}
                    />
                }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Conditions</ThemedText>
                </ThemedView>

                <ThemedView style={styles.disclaimerContainer}>
                    <ThemedText type="subtitle">Disclaimer</ThemedText>
                    <ThemedText style={styles.disclaimerText}>
                        We purposefully pull information straight from reliable sources such as Mayo Clinic because **WE ARE NOT MEDICAL PROFESSIONALS, WE ARE HIGH SCHOOL STUDENTS**
                    </ThemedText>
                    <ThemedText style={styles.disclaimerText}>
                        Always always always consult a doctor for any medical advice and never self-diagnose.
                    </ThemedText>
                </ThemedView>

                {Object.entries(conditions).map(([key, condition]) => (
                    <TouchableOpacity 
                        key={key}
                        style={styles.conditionContainer}
                        onPress={() => setSelectedCondition(key)}
                    >
                        <View style={styles.conditionHeader}>
                            <ThemedText type="subtitle">{condition.title}</ThemedText>
                            <IconSymbol name="chevron.right" size={20} color="#808080" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ParallaxScrollView>

            <Modal
                visible={selectedCondition !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedCondition(null)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedCondition(null)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.modalHeader}>
                                <ThemedText type="title" style={styles.modalTitle}>
                                    {selectedCondition ? conditions[selectedCondition].title : ''}
                                </ThemedText>
                                <TouchableOpacity 
                                    onPress={() => setSelectedCondition(null)}
                                    style={styles.closeButton}
                                >
                                    <IconSymbol name="xmark.circle.fill" size={24} color="#808080" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalBody}>
                                <View style={styles.infoSection}>
                                    <ThemedText style={styles.sectionTitle}>How is it detected?</ThemedText>
                                    <ThemedText style={styles.sectionContent}>
                                        {selectedCondition ? conditions[selectedCondition].detection : ''}
                                    </ThemedText>
                                </View>
                                {selectedCondition && conditions[selectedCondition].effects && (
                                    <View style={styles.infoSection}>
                                        <ThemedText style={styles.sectionTitle}>What are its effects?</ThemedText>
                                        <ThemedText style={styles.sectionContent}>
                                            {conditions[selectedCondition].effects}
                                        </ThemedText>
                                    </View>
                                )}
                                <View style={styles.infoSection}>
                                    <ThemedText style={styles.sectionTitle}>Source</ThemedText>
                                    <ThemedText style={styles.sectionContent}>
                                        {selectedCondition ? conditions[selectedCondition].citation : ''}
                                    </ThemedText>
                                    <TouchableOpacity 
                                        onPress={() => selectedCondition && openWebsite(conditions[selectedCondition].citationLink)}
                                    >
                                        <ThemedText style={styles.link}>
                                            {selectedCondition ? conditions[selectedCondition].citationLink : ''}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    conditionContainer: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 12,
    },
    conditionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    citationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
    },
    citationText: {
        flexShrink: 1,
    },
    link: {
        color: '#0066CC',
    },
    divider: {
        height: 5,
        backgroundColor: '#000000',
        marginVertical: 16,
        width: '100%',
    },
    disclaimerContainer: {
        gap: 4,
        marginBottom: 50,
    },
    disclaimerText: {
        fontStyle: 'italic',
        color: 'red'
    },
    citationSection: {
        marginTop: 50,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    closeButton: {
        padding: 4,
        flexShrink: 0,
    },
    modalTitle: {
        flex: 1,
        marginRight: 8,
    },
    modalBody: {
        maxHeight: '100%',
    },
    infoSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#000000',
    },
    sectionContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333333',
    }
}); 
