export type Classification = {
    timestamp: Date,
    imagePath: string | null,
    classification: string,
    confidence: number,
}