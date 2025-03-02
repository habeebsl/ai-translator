<script setup>
const props = defineProps({
    onlyChild: {
        type: Boolean,
        default: true
    }
})
</script>

<template>
    <div class="spinner-container"  :style="{ marginTop: props.onlyChild ? '' : '10px' }">
        <div class="spinner"></div>
    </div>
</template>
  
<style scoped>
.spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3498db;
    animation: spin 1s ease-in-out infinite;
}
  
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>