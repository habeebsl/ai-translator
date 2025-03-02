<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    languages: {
        type: Array,
        required: true
    },
    selectedLanguage: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'left'
    }
});

const emit = defineEmits(['update:selectedLanguage']);

const isOpen = ref(false);
const searchQuery = ref('');

const filteredLanguages = computed(() => {
    if (!searchQuery.value) return props.languages;

    return props.languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

function toggleDropdown() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        searchQuery.value = '';
    }
}

function selectLanguage(code) {
    emit('update:selectedLanguage', code);
    isOpen.value = false;
}

function handleClickOutside(event) {
    if (!event.target.closest('.language-selector')) {
        isOpen.value = false;
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
}
</script>

<template>
  <div class="language-selector" :class="position">
    <button @click.stop="toggleDropdown" class="selector-button">
        {{ languages.find(lang => lang.code === selectedLanguage)?.name || 'Select language' }}
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#D3D3D4">
            <path d="M7 10l5 5 5-5z"/>
        </svg>
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <div class="search-container">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Search language..."
            @click.stop
            class="search-input"
        />
      </div>
      <div class="language-list">
        <div
            v-for="language in filteredLanguages"
            :key="language.code"
            @click.stop="selectLanguage(language.code)"
            class="language-option"
            :class="{ 'selected': language.code === selectedLanguage }"
        >
          {{ language.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.language-selector {
    position: relative;
    flex: 1;
}

.language-selector.left {
    margin-right: 0;
}

.language-selector.right {
    margin-left: 0;
}

.selector-button {
    width: 100%;
    background-color: #252427;
    color: #D3D3D4;
    border: 0;
    border-radius: 5px;
    padding: 13px 15px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    box-sizing: border-box;
}

.selector-button:hover {
    background-color: rgba(0, 0, 0, 0.3);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background-color: #32333a;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-height: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 100;
}

.search-container {
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(0, 0, 0, 0.2);
    color: #D3D3D4;
    font-size: 14px;
    box-sizing: border-box;
}

.search-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
}

.language-list {
    overflow-y: auto;
    max-height: 250px;
}

.language-option {
    padding: 10px 15px;
    cursor: pointer;
    color: #D3D3D4;
    font-size: 14px;
}

.language-option:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.language-option.selected {
    background-color: rgba(66, 133, 244, 0.2);
}

.language-list {
    scrollbar-width: thin;
    scrollbar-color: #686868 #424242;
}

.language-list::-webkit-scrollbar {
    width: 8px;
}

.language-list::-webkit-scrollbar-track {
    background: #424242;
}

.language-list::-webkit-scrollbar-thumb {
    background-color: #686868;
    border-radius: 4px;
}
</style>