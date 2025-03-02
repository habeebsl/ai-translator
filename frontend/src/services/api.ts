import axios from "axios"
import { useTranslator } from "@/stores/translatorStore"

const BASE_URL = import.meta.env.VITE_API_BASE

const apiClient = axios.create({
	baseURL: `https://${BASE_URL}/api`,
	headers: {
		'Content-Type': 'application/json'
	}
})

export const apiService = {
    generateSpeech(text: string) {
        return apiClient.post("/generate-speech", { text: text }, { 
            responseType: 'arraybuffer' 
        })
    }
}

export const transcribeWebSocketConnect = {
    socket: null as WebSocket | null,
    isConnecting: false,
    messageListeners: [] as ((data: any) => void)[],
    
    init() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(`wss://${BASE_URL}/ws/transcribe`);
            
            this.socket.addEventListener('open', () => {
                console.log('Connected to Transcription WebSocket server');
            });
            
            this.socket.addEventListener('message', (event) => {
                console.log('Raw message received:', event.data);
                this.messageListeners.forEach(listener => listener(event.data));
            });
            
            this.socket.addEventListener('error', (event) => {
                const translatorStore = useTranslator()
                translatorStore.activateMic = false
                translatorStore.transcriptErrorMessage = "Can't connect to server. Check your internet and try again."
                translatorStore.showTranscriptError = true
                console.error('WebSocket error:', event);
            });
            
            this.socket.addEventListener('close', () => {
                console.log('Disconnected from WebSocket server');
            });
        }
    },

    onMessage(callback: (data: any) => void) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(l => l !== callback);
        };
    },
    
    ensureWebSocketConnection() {
        if (!this.socket) {
            this.init();
        } else if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
            this.init();
        }

        return new Promise<void>((resolve) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
            } else if (this.socket) {
                this.socket.addEventListener('open', () => resolve());
            }
        });
    }
};

export const translateWebsocketConnect = {
    socket: null as WebSocket | null,
    isConnecting: false,
    messageListeners: [] as ((data: any) => void)[],

    init() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(`wss://${BASE_URL}/ws/translate`);
            
            this.socket.addEventListener('open', () => {
                console.log('Connected to Translation WebSocket server');
            });
            
            this.socket.addEventListener('message', (event) => {
                console.log('Raw message received:', event.data);
                this.messageListeners.forEach(listener => listener(event.data));
            });
            
            this.socket.addEventListener('error', (event) => {
                const translatorStore = useTranslator()
                translatorStore.isProcessingQueue = false
                translatorStore.translateErrorMessage = "Can't connect to server. Check your internet and try again."
                translatorStore.showTranslateError = true
                console.error('WebSocket error:', event);
            });
            
            this.socket.addEventListener('close', () => {
                console.log('Disconnected from WebSocket server');
            });
        }
    },

    onMessage(callback: (data: any) => void) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(l => l !== callback);
        };
    },
    
    ensureWebSocketConnection() {
        if (!this.socket) {
            this.init();
        } else if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
            this.init();
        }

        return new Promise<void>((resolve) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
            } else if (this.socket) {
                this.socket.addEventListener('open', () => resolve());
            }
        });
    }
}