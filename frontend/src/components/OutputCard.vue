<script setup>
import { watch, ref, computed, watchEffect } from 'vue';
import TranslatorContainer from '@/components/TranslatorContainer.vue';
import TypingIndicator from '@/components/TypingIndicator.vue';
import CardErrorMessage from '@/components/CardErrorMessage.vue';
import NotificationMessage from '@/components/NotificationMessage.vue'
import Spinner from '@/components/Spinner.vue';
import { apiService } from '@/services/api';
import { useTranslator } from '@/stores/translatorStore';

const translatorStore = useTranslator();
const translationTimeout = ref(null);
const FAST_TYPE_THRESHOLD = 200;
const MIN_DEBOUNCE_DELAY = 300;
const MAX_DEBOUNCE_DELAY = 1000;
const lastKeyTime = ref(0);
const dynamicDebounceDelay = ref(MAX_DEBOUNCE_DELAY);
const audio = ref(null)

const isInitial = computed(() => {
    return !translatorStore.translatedText.trim();
});

const updateDebounceDelay = () => {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTime.value;
    lastKeyTime.value = now;

    if (timeSinceLastKey < FAST_TYPE_THRESHOLD) {
        dynamicDebounceDelay.value = MIN_DEBOUNCE_DELAY;
    } else {
        dynamicDebounceDelay.value = Math.min(
        dynamicDebounceDelay.value + 100,
        MAX_DEBOUNCE_DELAY
        );
    }
};

watch(
  () => translatorStore.userInput,
  (newValue, oldValue) => {
    if (!newValue.trim()) {
      translatorStore.cancelPendingTranslations();
      return;
    }

    if (newValue === oldValue || translatorStore.isProcessingQueue) {
        return;
    }

    if (translatorStore.activateMic) {
        dynamicDebounceDelay.value = 1000
    } else {
        updateDebounceDelay();
    }

    clearTimeout(translationTimeout.value);

    translationTimeout.value = setTimeout(() => {
        translatorStore.addToTranslationQueue();

        if (!translatorStore.isProcessingQueue) {
            translatorStore.processTranslationQueue();
        }
    }, dynamicDebounceDelay.value);
  }
);

const translateInput= () => {
    if (!translatorStore.userInput.trim()) return
    translatorStore.addToTranslationQueue()
    translatorStore.switchedSelector = false
    translatorStore.processTranslationQueue()
}

watchEffect(() => {
    if (translatorStore.switchedSelector) {
      translateInput()
    }
})

function playAudio(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);

    if (audio.value) {
        audio.value.pause();
        audio.value.src = '';
    }

    audio.value = new Audio(audioUrl);

    audio.value.onended = () => {
        URL.revokeObjectURL(audioUrl);
        translatorStore.audioPlaying = false;
    };

    audio.value.onerror = () => {
        console.error("Audio playback error");
        URL.revokeObjectURL(audioUrl);
        translatorStore.audioPlaying = false;
        translatorStore.errorMessage = "Error playing audio";
        translatorStore.showError = true;
        setTimeout(() => {
            translatorStore.showError = false;
        }, 3500);
    };

    translatorStore.audioPlaying = true
    audio.value.play();
}

const playTranslation = async () => {
  if (!translatorStore.translatedText) return;

  try {
    translatorStore.isGeneratingVoice = true
    const response = await apiService.generateSpeech(translatorStore.translatedText);
    translatorStore.isGeneratingVoice = false
    const blob = new Blob([response.data], { type: 'audio/mp3' })
    playAudio(blob)
    return

  } catch (error) {
    translatorStore.errorMessage = "Error generating speech"
    translatorStore.showError = true
    setTimeout(() => {
      translatorStore.showError = false
    }, 3500);
    console.error("Error generating speech:", error);

  } finally {
    translatorStore.isGeneratingVoice = false
  }
};

const handlePause = () => {
    if (audio.value) {
        audio.value.pause()
        translatorStore.audioPlaying = false
    }
}

const handleTryAgain = () => {
    translatorStore.showTranslateError = false
    translateInput()
}

const closeError = () => {
    translatorStore.showTranslateError = false
}

watch(
    [
        () => translatorStore.sourceLanguage,
        () => translatorStore.targetLanguage
    ],
    ([newSource, newTarget], [oldSource, oldTarget]) => {
        if (newSource !== oldSource || newTarget !== oldTarget) {
        clearTimeout(translationTimeout.value);

        translationTimeout.value = setTimeout(() => {
            if (translatorStore.userInput.trim()) {
            translatorStore.addToTranslationQueue();
            translatorStore.switchedSelector = false;

            if (!translatorStore.isProcessingQueue) {
                translatorStore.processTranslationQueue();
            }
            }
        }, 300);
        }
    }
);
</script>

<template>
    <NotificationMessage
        v-if="translatorStore.showError"
        :message="translatorStore.errorMessage"
        type="error"
    />
    <TranslatorContainer position="right">
        <div class="output-container">
        <div :class="`output-text ${isInitial ? 'initial' : 'output'}`">
            {{ isInitial ? "Translation" : translatorStore.translatedText }}
            <TypingIndicator v-if="translatorStore.isProcessingQueue" />
            <CardErrorMessage
                :message="translatorStore.translateErrorMessage"
                :show="translatorStore.showTranslateError"
                :show-try-again="true"
                @tryAgain="handleTryAgain"
                @close="closeError"
            />
        </div>
        </div>
        <button class="play-button" v-if="translatorStore.audioPlaying" @click="handlePause" :disabled="isInitial || translatorStore.isProcessingQueue || translatorStore.isGeneratingVoice">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
            </svg>
        </button>
        <button v-else class="play-button" @click="playTranslation" :disabled="isInitial || translatorStore.isProcessingQueue || translatorStore.isGeneratingVoice">
            <svg v-if="!translatorStore.isGeneratingVoice" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/>
            </svg>
            <Spinner v-else />
        </button>
    </TranslatorContainer>
</template>

<style scoped>
.output-container {
    position: relative;
    background-color: #252427;
    width: 100%;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.output-text {
    padding: 10px;
    font-size: 24px;
    font-family: sans-serif;
    min-height: 100%;
    box-sizing: border-box;
    flex: 1;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    word-break: break-word;
    max-width: 100%;
}

.output-text.initial {
    color: #D3D3D4;
}

.output-text.output {
    color: white;
}

.play-button {
    border: none;
    background-color: #252427;
    border-radius: 20px;
    height: 35px;
    width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: 10px;
}

.play-button:hover:not(:disabled) {
    background-color: #39435c;
}

.play-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

svg {
    fill: #D3D3D4;
}
</style>