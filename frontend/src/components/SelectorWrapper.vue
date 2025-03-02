<script setup>
import { ref } from 'vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import { useTranslator } from '@/stores/translatorStore';

const props = defineProps({
  sourceLanguages: {
	type: Array,
	default: () => [
	  { code: 'BG', name: 'Bulgarian' },
	  { code: 'CS', name: 'Czech' },
	  { code: 'DA', name: 'Danish' },
	  { code: 'DE', name: 'German' },
	  { code: 'EL', name: 'Greek' },
	  { code: 'EN', name: 'English' },
	  { code: 'ES', name: 'Spanish' },
	  { code: 'ET', name: 'Estonian' },
	  { code: 'FI', name: 'Finnish' },
	  { code: 'FR', name: 'French' },
	  { code: 'HU', name: 'Hungarian' },
	  { code: 'ID', name: 'Indonesian' },
	  { code: 'IT', name: 'Italian' },
	  { code: 'JA', name: 'Japanese' },
	  { code: 'KO', name: 'Korean' },
	  { code: 'LT', name: 'Lithuanian' },
	  { code: 'LV', name: 'Latvian' },
	  { code: 'NL', name: 'Dutch' },
	  { code: 'PL', name: 'Polish' },
	  { code: 'PT', name: 'Portuguese' },
	  { code: 'RO', name: 'Romanian' },
	  { code: 'RU', name: 'Russian' },
	  { code: 'SK', name: 'Slovak' },
	  { code: 'SL', name: 'Slovenian' },
	  { code: 'SV', name: 'Swedish' },
	  { code: 'TR', name: 'Turkish' },
	  { code: 'UK', name: 'Ukrainian' },
	  { code: 'ZH', name: 'Chinese' }
	]
  },

  targetLanguages: {
	type: Array,
	default: () => [
	  { code: 'AR', name: 'Arabic' },
	  { code: 'BG', name: 'Bulgarian' },
	  { code: 'CS', name: 'Czech' },
	  { code: 'DA', name: 'Danish' },
	  { code: 'DE', name: 'German' },
	  { code: 'EL', name: 'Greek' },
	  { code: 'EN-US', name: 'English (American)' },
	  { code: 'EN-GB', name: 'English (British)' },
	  { code: 'ES', name: 'Spanish' },
	  { code: 'ET', name: 'Estonian' },
	  { code: 'FI', name: 'Finnish' },
	  { code: 'FR', name: 'French' },
	  { code: 'HU', name: 'Hungarian' },
	  { code: 'ID', name: 'Indonesian' },
	  { code: 'IT', name: 'Italian' },
	  { code: 'JA', name: 'Japanese' },
	  { code: 'KO', name: 'Korean' },
	  { code: 'LT', name: 'Lithuanian' },
	  { code: 'LV', name: 'Latvian' },
	  { code: 'NL', name: 'Dutch' },
	  { code: 'PL', name: 'Polish' },
	  { code: 'PT-PT', name: 'Portuguese' },
      { code: 'PT-BR', name: 'Portuguese (Brazilian)' },
	  { code: 'RO', name: 'Romanian' },
	  { code: 'RU', name: 'Russian' },
	  { code: 'SK', name: 'Slovak' },
	  { code: 'SL', name: 'Slovenian' },
	  { code: 'SV', name: 'Swedish' },
	  { code: 'TR', name: 'Turkish' },
	  { code: 'UK', name: 'Ukrainian' },
	  { code: 'ZH-HANS', name: 'Chinese (simplified)' },
      { code: 'ZH-HANT', name: 'Chinese (traditional)' }
	]
  }
});

const translatorStore = useTranslator()
const sourceLanguage = ref('EN');
const targetLanguage = ref('ES');


function updateSourceLanguage(code) {
	sourceLanguage.value = code;
	translatorStore.sourceLanguage = code
	translatorStore.switchedSelector = true
}

function updateTargetLanguage(code) {
	targetLanguage.value = code;
	translatorStore.targetLanguage = code
	translatorStore.switchedSelector = true
}
</script>

<template>
	<div class="selector-wrapper">
		<LanguageSelector
			:languages="sourceLanguages"
			v-model:selectedLanguage="sourceLanguage"
			position="left"
			@update:selectedLanguage="updateSourceLanguage"
		/>
		<LanguageSelector
			:languages="targetLanguages"
			v-model:selectedLanguage="targetLanguage"
			position="right"
			@update:selectedLanguage="updateTargetLanguage"
		/>
	</div>
</template>

<style scoped>
.selector-wrapper {
	display: flex;
	width: 100%;
	padding: 10px 20px;
	background-color: #252427;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	box-sizing: border-box;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	gap: 10px;
}

@media (max-width: 768px) {
	.selector-wrapper {
		gap: 5px;
		border-radius: 0;
		padding: 10px;
	}
}
</style>