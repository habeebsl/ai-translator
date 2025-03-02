<script setup>
const props = defineProps({
	message: {
		type: String,
		required: true
	},
	type: {
		type: String,
		default: 'error',
		validator: (value) => ['error', 'success'].includes(value)
	}
})

const getTypeStyles = () => {
  const styles = {
	error: {
		background: '#fef2f2',
		border: '#fee2e2',
		borderLeft: '#ef4444',
		progressBar: '#ef4444',
		text: '#991b1b'
	},
	success: {
		background: '#f0fdf4',
		border: '#dcfce7',
		borderLeft: '#22c55e',
		progressBar: '#22c55e',
		text: '#166534'
	}
  }
  return styles[props.type];
}
</script>

<template>
<Transition name="slide-fade">
	<div
		class="message"
		:style="{
			backgroundColor: getTypeStyles().background,
			borderColor: getTypeStyles().border,
			borderLeftColor: getTypeStyles().borderLeft,
			color: getTypeStyles().text
		}"
	>
		<div class="message-content">
			<svg
				v-if="type === 'error'"
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<svg
				v-else
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
			>
				<path d="M20 6L9 17l-5-5"></path>
			</svg>
			{{ message }}
		</div>
		<div
			class="progress-bar"
			:style="{ backgroundColor: getTypeStyles().progressBar }"
		></div>
	</div>
</Transition>
</template>

<style scoped>
.message {
	position: fixed;
	top: 20px;
	right: 20px;
	padding: 16px 20px;
	border-width: 1px;
	border-style: solid;
	border-left-width: 4px;
	border-radius: 6px;
	box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	max-width: 400px;
	z-index: 9999;
	font-size: 14px;
}

.message-content {
	display: flex;
	align-items: center;
	gap: 12px;
}

.icon {
	width: 20px;
	height: 20px;
	stroke-width: 2;
}

.progress-bar {
	position: absolute;
	bottom: 0;
	left: 0;
	height: 3px;
	animation: progress 3s linear forwards;
}

@keyframes progress {
	from { width: 100%; }
	to { width: 0%; }
}

.slide-fade-enter-active {
	transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
	transform: translateX(20px);
	opacity: 0;
}

.slide-fade-leave-to {
	transform: translateX(20px);
	opacity: 0;
}
</style>