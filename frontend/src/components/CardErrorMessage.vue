<script setup>
import { ref, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
    message: {
        type: String,
        default: ''
    },
    show: {
        type: Boolean,
        default: false
    },
    autoDismiss: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number,
        default: 5000
    },
    showTryAgain: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'tryAgain']);

const errorTimeout = ref(null);

const startDismissTimer = () => {
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
    }
    
    errorTimeout.value = setTimeout(() => {
        emit('close');
    }, props.duration);
};

const closeError = () => {
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
    }
    emit('close');
};

const handleTryAgain = () => {
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
    }
    emit('tryAgain');
    closeError();
};

watch(
    () => props.show,
    (newVal) => {
        if (newVal && props.autoDismiss) {
        startDismissTimer();
        } else if (!newVal && errorTimeout.value) {
        clearTimeout(errorTimeout.value);
        }
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    if (errorTimeout.value) {
        clearTimeout(errorTimeout.value);
    }
});
</script>

<template>
    <transition name="fade">
        <div v-if="show" class="error-message">
        <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        </div>
        <span class="error-text">{{ message }}</span>
        <button v-if="showTryAgain" class="try-again-btn" @click="handleTryAgain">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
            Try Again
        </button>
        <button class="close-error" @click="closeError">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        </div>
    </transition>
</template>

<style scoped>
.error-message {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    background-color: rgba(224, 49, 49, 0.9);
    color: white;
    padding: 10px 12px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.error-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.error-text {
    flex-grow: 1;
    margin-right: 8px;
}

.try-again-btn {
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    margin-right: 8px;
    transition: background-color 0.2s;
}

.try-again-btn svg {
    margin-right: 4px;
}

.try-again-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.close-error {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.close-error:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>