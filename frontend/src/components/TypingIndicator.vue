<template>
    <div class="typing-indicator">
        <div class="typing-indicator__dots">
            <span class="typing-indicator__dot"></span>
            <span class="typing-indicator__dot"></span>
            <span class="typing-indicator__dot"></span>
        </div>
    </div>
</template>

<style scoped>
.typing-indicator {
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    border-radius: 20px;
    padding: 6px 12px;
    margin: 5px 0;
}

.typing-indicator__dots {
    display: flex;
    align-items: center;
}

.typing-indicator__dot {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #606060;
    border-radius: 50%;
    display: inline-block;
    opacity: 0.4;
    animation: pulse 1.5s infinite ease-in-out;
}

.typing-indicator__dot:nth-child(1) {
    animation-delay: 0s;
}

.typing-indicator__dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator__dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes pulse {
    0%, 50%, 100% {
        transform: scale(1);
        opacity: 0.4;
    }
    25% {
        transform: scale(1.5);
        opacity: 1;
    }
}
</style>