import { StyleSheet, TouchableOpacity, Image, RefreshControl, View, Modal, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useEffect, useState, useCallback } from 'react';
import { Classification } from '@/types/classification';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getClassificationHistory, clearClassificationHistory } from '@/utils/storage';
import { Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HistoryScreen() {
    const [history, setHistory] = useState<Classification[]>([]);
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const colorScheme = useColorScheme() ?? 'light';

    const loadHistory = async () => {
        const retrievedHistory = await getClassificationHistory();
        if (retrievedHistory) {
            // Sort by timestamp in descending order (most recent first)
            retrievedHistory.sort((a: Classification, b: Classification) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setHistory(retrievedHistory);
            setClassifications(retrievedHistory);
        } else {
            setHistory([]);
            setClassifications([]);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadHistory();
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleClearAll = async () => {
        await clearClassificationHistory();
        setClassifications([]);
        await loadHistory();
    };

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#E6E6FA', dark: '#2D2D3D' }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="clock.fill"
                        style={styles.headerImage}
                    />
                }
                refreshing={refreshing}
                onRefresh={onRefresh}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Analysis History</ThemedText>
                </ThemedView>

                {/* Recent Analyses */}
                <ThemedView style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle">Recent Analyses</ThemedText>
                        <TouchableOpacity 
                            style={styles.clearButton}
                            onPress={handleClearAll}
                        >
                            <IconSymbol name="trash" size={20} color="#FF3B30" />
                            <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {classifications.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <IconSymbol name="clock" size={40} color="#808080" />
                            <ThemedText style={styles.emptyStateText}>No analyses yet</ThemedText>
                        </ThemedView>
                    ) : (
                        classifications.map((classification) => (
                            <ThemedView key={new Date(classification.timestamp).toLocaleString()} style={styles.analysisCard}>
                                <ThemedText type="defaultSemiBold">{new Date(classification.timestamp).toLocaleString()}</ThemedText>
                                <View style={styles.infoRow}>
                                    <IconSymbol name="heart.text.square" size={16} color="#808080" style={styles.icon} />
                                    <ThemedText>{classification.classification}</ThemedText>
                                </View>
                                <View style={styles.infoRow}>
                                    <IconSymbol name="gauge" size={16} color="#808080" style={styles.icon} />
                                    <ThemedText>{Math.round(classification.confidence * 100)}%</ThemedText>
                                </View>
                                {classification.imagePath && (
                                    <TouchableOpacity 
                                        onPress={() => setSelectedImage(classification.imagePath)}
                                        style={styles.imageContainer}
                                    >
                                        <Image 
                                            source={{ uri: classification.imagePath }} 
                                            style={styles.imagePreview}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                            </ThemedView>
                        ))
                    )}
                </ThemedView>
            </ParallaxScrollView>

            {/* Full Screen Image Modal */}
            <Modal
                visible={selectedImage !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <TouchableOpacity 
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setSelectedImage(null)}
                >
                    <View style={styles.modalContent}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -50,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
        gap: 12,
    },
    analysisCard: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        gap: 16,
    },
    imageContainer: {
        marginTop: 8,
    },
    imagePreview: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    analysisInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        gap: 8,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: screenWidth,
        height: screenHeight,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 8,
    },
    clearButtonText: {
        color: '#FF3B30',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 8,
    },
    emptyStateText: {
        color: '#808080',
        fontSize: 16,
    },
}); 
