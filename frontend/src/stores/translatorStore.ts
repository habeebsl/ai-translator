import { defineStore } from 'pinia'
import { translateWebsocketConnect } from '@/services/api';

interface TranslationQueue {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    timestamp: number;
}

export const useTranslator = defineStore('translator', {
    state: () => ({
        userInput: '',
        audioTranscript: '',
        translatedText: '',
        sourceLanguage: 'EN',
        targetLanguage: 'ES',
        previousSourceLanguage: 'EN',
        previousTargetLanguage: 'ES',
        switchedSelector: false,
        isGeneratingVoice: false,
        activateMic: false,
        isTalking: false,
        audioPlaying: false,
        isProcessingQueue: false,
        translationQueue: [] as TranslationQueue[],
        currentTranslationTimeout: null as number | null,
        errorMessage: null as string | null,
        showError: false,
        showTranscriptError: false,
        transcriptErrorMessage: null as string | null,
        showTranslateError: false,
        translateErrorMessage: null as string | null,
        maxQueueSize: 10
    }),

    actions: {
        addToTranslationQueue() {
            if (this.translationQueue.length >= this.maxQueueSize) {
                this.translationQueue.shift();
            }

            this.translationQueue.push({
                text: this.userInput,
                sourceLanguage: this.sourceLanguage,
                targetLanguage: this.targetLanguage,
                timestamp: Date.now()
            });
        },

        async processTranslationQueue() {
            if (this.isProcessingQueue || this.translationQueue.length === 0) return;

            this.isProcessingQueue = true;

            try {
                const queueItem = this.translationQueue.shift();

                if (!queueItem) {
                    this.isProcessingQueue = false;
                    return;
                }

                const { text, sourceLanguage, targetLanguage } = queueItem;

                await translateWebsocketConnect.ensureWebSocketConnection();

                const data = JSON.stringify({
                    text,
                    source_language: sourceLanguage,
                    target_language: targetLanguage
                });

                const timeoutId = setTimeout(() => {
                    console.error("Translation request timed out");
                    this.isProcessingQueue = false;
                    this.translateErrorMessage = "Translation request timed out";
                    this.showTranslateError = true;

                    if (this.translationQueue.length > 0) {
                        setTimeout(() => {
                            this.processTranslationQueue();
                        }, 500);
                    }
                }, 15000);

                this.currentTranslationTimeout = timeoutId;

                if (translateWebsocketConnect.socket &&
                    translateWebsocketConnect.socket.readyState === WebSocket.OPEN) {
                    translateWebsocketConnect.socket.send(data);
                } else {
                    this.clearTranslationTimeout();
                    throw new Error("WebSocket not open");
                }
            } catch (error) {
                console.error("Translation error:", error);
                this.isProcessingQueue = false;
                this.translateErrorMessage = "An error occurred during translation";
                this.showTranslateError = true;
                this.clearTranslationTimeout();

                setTimeout(() => {
                    if (this.translationQueue.length > 0) {
                        this.processTranslationQueue();
                    }
                }, 1000);
            }
        },

        setSourceLanguage(language: string) {
            this.previousSourceLanguage = this.sourceLanguage;
            this.sourceLanguage = language;
            this.handleLanguageChange();
        },

        setTargetLanguage(language: string) {
            this.previousTargetLanguage = this.targetLanguage;
            this.targetLanguage = language;
            this.handleLanguageChange();
        },

        handleLanguageChange() {
            if (this.sourceLanguage !== this.previousSourceLanguage ||
                this.targetLanguage !== this.previousTargetLanguage) {

                this.translationQueue = [];

                if (this.userInput.trim()) {
                    this.switchedSelector = true;
                }
            }
        },

        clearTranslationTimeout() {
            if (this.currentTranslationTimeout !== null) {
                clearTimeout(this.currentTranslationTimeout);
                this.currentTranslationTimeout = null;
            }
        },

        cancelPendingTranslations() {
            this.translationQueue = [];
            this.isProcessingQueue = false;
            this.translatedText = '';
            this.clearTranslationTimeout();
        },

        cleanupAbandonedTranslations() {
            const currentTime = Date.now();
            const maxAge = 5 * 60 * 1000;

            const oldCount = this.translationQueue.length;
            this.translationQueue = this.translationQueue.filter(item => {
                return (currentTime - item.timestamp) < maxAge;
            });

            const removedCount = oldCount - this.translationQueue.length;
            if (removedCount > 0) {
                console.log(`Removed ${removedCount} abandoned translations`);
            }
        },

        reset() {
            this.clearTranslationTimeout();

            if (translateWebsocketConnect.socket &&
                translateWebsocketConnect.socket.readyState === WebSocket.OPEN) {
                translateWebsocketConnect.socket.close();
            }

            this.translationQueue = [];
            this.isProcessingQueue = false;
            this.activateMic = false;
            this.isTalking = false;
            this.audioPlaying = false;
            this.isGeneratingVoice = false;
        }
    }
})