<script setup>
import { watchEffect, ref, onBeforeUnmount, onMounted } from 'vue';
import TranslatorWrapper from '@/components/TranslatorWrapper.vue';
import NotificationMessage from '@/components/NotificationMessage.vue'
import { useTranslator } from '@/stores/translatorStore';
import { transcribeWebSocketConnect, translateWebsocketConnect } from '@/services/api';

const translatorStore = useTranslator()
const mediaRecorder = ref(null)
const mediaInterval = ref(null)
const recording = ref(false)
const audioContext = ref(null)
const analyser = ref(null)
const audioSource = ref(null)
const silenceTimer = ref(null)
const cleanupInterval = ref(null)

const startRecording = async (language) => {
    await transcribeWebSocketConnect.ensureWebSocketConnection();

    try {
        if (mediaRecorder.value && mediaRecorder.value.state === "recording") {
            stopRecording();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.value = new MediaRecorder(stream, { mimeType: "audio/webm" });
        recording.value = true;

        audioContext.value = new (window.AudioContext)();
        audioSource.value = audioContext.value.createMediaStreamSource(stream);
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = 256;
        audioSource.value.connect(analyser.value);

        detectVoiceActivity();

        mediaRecorder.value.ondataavailable = async (event) => {
            if (event.data.size > 0 && recording.value) {
                await transcribeWebSocketConnect.ensureWebSocketConnection();

                const audioBlob = event.data;
                const arrayBuffer = await audioBlob.arrayBuffer();

                const metadata = JSON.stringify({ language });
                transcribeWebSocketConnect.socket.send(metadata);

                setTimeout(() => {
                    transcribeWebSocketConnect.socket.send(arrayBuffer);
                }, 100);

                if (recording.value && mediaRecorder.value && mediaRecorder.value.state !== "recording") {
                    mediaRecorder.value.start();
                }
            }
        };

        mediaRecorder.value.start();

        mediaInterval.value = setInterval(() => {
            if (mediaRecorder.value && mediaRecorder.value.state === "recording") {
                mediaRecorder.value.stop();
            }
        }, 3000);
    } catch (error) {
        translatorStore.errorMessage = "Couldn't connect to microphone"
        translatorStore.showError = true
        setTimeout(() => {
            translatorStore.showError = false
        }, 3500);
        console.error('Error accessing microphone:', error);
    }
}

const detectVoiceActivity = () => {
    if (!analyser.value) return;

    const bufferLength = analyser.value.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
        if (!analyser.value || !recording.value) return;

        analyser.value.getByteFrequencyData(dataArray);

        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const averageVolume = sum / bufferLength;

        const button = document.querySelector('.speech-button');
        if (button) {
            const scale = 1 + (averageVolume / 255) * 0.3;
            button.style.transform = `scale(${scale})`;
            const glowOpacity = averageVolume / 255 * 0.8;
            button.style.setProperty('--glow-opacity', glowOpacity);
        }

        if (recording.value) {
            requestAnimationFrame(checkAudioLevel);
        }
    };

    requestAnimationFrame(checkAudioLevel);
};

const stopRecording = () => {
    recording.value = false;
    clearInterval(mediaInterval.value);

    const button = document.querySelector('.speech-button');
    if (button) {
        button.style.transform = '';
        button.style.setProperty('--glow-opacity', 0);
    }

    if (silenceTimer.value) {
        clearTimeout(silenceTimer.value);
        silenceTimer.value = null;
    }

    if (mediaRecorder.value) {
        if (mediaRecorder.value.state === "recording") {
            mediaRecorder.value.stop();
        }

        if (mediaRecorder.value.stream) {
            mediaRecorder.value.stream.getTracks().forEach(track => track.stop());
        }
    }

    if (audioSource.value) {
        audioSource.value.disconnect();
        audioSource.value = null;
    }

    if (audioContext.value) {
        audioContext.value.close().catch(e => console.error("Error closing audio context:", e));
        audioContext.value = null;
    }

    analyser.value = null;

    if (transcribeWebSocketConnect.socket &&
        transcribeWebSocketConnect.socket.readyState === WebSocket.OPEN) {
        transcribeWebSocketConnect.socket.close();
    }
}

watchEffect(() => {
    if (translatorStore.activateMic) {
        startRecording(translatorStore.sourceLanguage);
    } else if (!translatorStore.activateMic && mediaRecorder.value) {
        stopRecording();
    }
})

onMounted(() => {
    const unsubscribeFromTranscription = transcribeWebSocketConnect.onMessage((data) => {
        console.log('Component received message:', data);
        try {
            const message = JSON.parse(data);
            if (message.error) {
                translatorStore.activateMic = false;
                translatorStore.transcriptErrorMessage = "Error occurred while generating transcript";
                translatorStore.showTranscriptError = true;
            } else {
                translatorStore.audioTranscript = message.message;
            }
        } catch (error) {
            console.error("Error parsing transcription data:", error);
            translatorStore.transcriptErrorMessage = "Error processing transcription data";
            translatorStore.showTranscriptError = true;
        }
    });

    const unsubscribeFromTranslation = translateWebsocketConnect.onMessage((data) => {
        console.log('Component received translation:', data);

        try {
            const message = JSON.parse(data);

            if (message.error) {
                translatorStore.isProcessingQueue = false;
                translatorStore.translateErrorMessage = "An error occurred while generating translation";
                translatorStore.showTranslateError = true;

                translatorStore.clearTranslationTimeout();

                setTimeout(() => {
                    if (translatorStore.translationQueue.length > 0) {
                        translatorStore.processTranslationQueue();
                    }
                }, 500);

                return;
            }

            translatorStore.clearTranslationTimeout();

            translatorStore.translatedText = message.message;

            translatorStore.translating = false;
            translatorStore.isProcessingQueue = false;

            setTimeout(() => {
                if (translatorStore.translationQueue.length > 0) {
                    translatorStore.processTranslationQueue();
                }
            }, 100);
        } catch (error) {
            console.error("Error parsing translation data:", error);
            translatorStore.isProcessingQueue = false;
            translatorStore.translateErrorMessage = "Error processing translation data";
            translatorStore.showTranslateError = true;
            translatorStore.clearTranslationTimeout();
        }
    });

    transcribeWebSocketConnect.ensureWebSocketConnection();
    translateWebsocketConnect.ensureWebSocketConnection();

    cleanupInterval.value = setInterval(() => {
        translatorStore.cleanupAbandonedTranslations();
    }, 60000);

    onBeforeUnmount(() => {
        unsubscribeFromTranscription();
        unsubscribeFromTranslation();

        stopRecording();

        if (cleanupInterval.value) {
            clearInterval(cleanupInterval.value);
        }

        translatorStore.reset();
    });
});
</script>

<template>
    <NotificationMessage
        v-if="translatorStore.showError"
        :message="translatorStore.errorMessage"
        type="error"
    />
    <TranslatorWrapper />
</template>