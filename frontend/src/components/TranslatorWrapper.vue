<script setup>
import SelectorWrapper from '@/components/SelectorWrapper.vue';
import InputCard from '@/components/InputCard.vue';
import OutputCard from '@/components/OutputCard.vue';

</script>

<template>
    <div class="app-container">
        <div class="app-wrapper">
            <SelectorWrapper />
            <div class="wrapper">
                <InputCard />
                <OutputCard />
            </div>
        </div>
  </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    width: 100%;
    height: auto;
}

@media (max-width: 768px) {
    .wrapper {
        flex-direction: column;
        height: auto;
        gap: 0;
    }
}

.app-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    min-height: 100%;
}

.app-wrapper {
    max-width: 1200px;
    width: 100%;
    display: flex;
    flex-direction: column;
}

@media (max-width: 768px) {
    .app-container {
        padding: 0;
    }
}
</style>