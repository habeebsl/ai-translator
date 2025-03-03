<script setup>
import { ref, watch } from 'vue';
import CardErrorMessage from '@/components/CardErrorMessage.vue';
import TranslatorContainer from '@/components/TranslatorContainer.vue';
import { useTranslator } from '@/stores/translatorStore';
import Spinner from '@/components/Spinner.vue';

const translatorStore = useTranslator()
const userInput = ref('')


watch(userInput, (newValue) => {
    translatorStore.userInput = newValue
})

const toggleMic = () => {
    translatorStore.activateMic = !translatorStore.activateMic
}

const closeError = () => {
    translatorStore.showTranscriptError = false
}

const clearInput = () => {
    userInput.value = ''
    translatorStore.userInput = ''
}

watch(
    () => translatorStore.audioTranscript,
    (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
            userInput.value += newVal

            translatorStore.audioTranscript = '';
            
            setTimeout(() => {
                if (translatorStore.userInput.trim()) {
                    translatorStore.addToTranslationQueue();
                    
                    if (!translatorStore.isProcessingQueue) {
                        translatorStore.processTranslationQueue();
                    }
                }
            }, 300);
        }
    }
)

</script>

<template>
    <TranslatorContainer position="left">
        <div class="input-container">
            <textarea v-model="userInput" name="input" id="input-field" placeholder="Say Something ..."></textarea>
            <CardErrorMessage 
                :message="translatorStore.transcriptErrorMessage" 
                :show="translatorStore.showTranscriptError"
                @close="closeError"
            />
        </div>
        <div class="action-container">
            <button :class="`speech-button ${translatorStore.activateMic ? 'active' : ''}`" @click="toggleMic">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                    <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/>
                </svg>
            </button>
            <div class="action-buttons">
                <Spinner
                    :onlyChild="false" 
                    v-if="translatorStore.activateMic" 
                />
                <button class="clear-button" v-if="translatorStore.userInput" @click="clearInput">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#D3D3D4">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        </div>
    </TranslatorContainer>
</template>

<style scoped>
.input-container {
    position: relative;
    background-color: #252427;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
}

#input-field {
    width: 100%;
    height: 100%;
    resize: none;
    border: none;
    outline: none;
    background-color: #252427;
    color: white;
    font-size: 24px;
    font-family: sans-serif;
    padding: 10px;
    box-sizing: border-box;
    scrollbar-color: #686868 #424242;
    flex: 1;
}

.action-container {
    display: flex;
    justify-content: space-between;
}

.action-buttons {
    display: flex;
    gap: 20px;
}

.speech-button, .clear-button { 
    position: relative;
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
    transition: transform 0.1s ease-out, background-color 0.1s ease-out;
}

.speech-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%);
    opacity: var(--glow-opacity, 0);
    transition: opacity 0.08s ease-out;
    pointer-events: none;
    border-radius: 30px;
}

.speech-button:hover, .clear-button:hover {
    background-color: #39435c;
}

svg {
    fill: #D3D3D4;
}

@media (hover: none) {
    .speech-button:hover {
        background-color: initial;
        color: initial;
    }
}

.speech-button.active {
    background-color: #293146;
}
</style>