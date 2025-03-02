<script setup>
const props = defineProps({
    position: String
})

</script>

<template>
    <div :class="`container ${position}`">
        <slot></slot>
    </div>
</template>

<style scoped>
.container {
    background-color: #252427;
    position: relative;
    width: 50%;
    padding: 20px;
    border-radius: 0;
    height: 300px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.container.left {
    border-bottom-left-radius: 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.container.right {
    border-bottom-right-radius: 20px;
}

@media (max-width: 768px) {
    .container {
        width: 100%;
        margin: 0;
        padding: 10px;
        height: 250px;
    }

    .container.left {
        border-radius: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-right: none;
    }

    .container.right {
        border-radius: 0;
    }
}
</style>