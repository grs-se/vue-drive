<template>
	<div
		class="upload-controls"
		@mouseenter="hovered = true"
		@mouseleave="hovered = false"
	>
		<!-- {{ item.progress }} -->
		<template v-if="!hovered">
			<ProgressRing :progress="item.progress" v-if="isUploading" />
			<div class="upload-action" v-else>
				<div class="action-cancelled" v-if="isCancelled">
					<icon-exclamation />
				</div>
				<div class="action-complete" v-else-if="isComplete">
					<icon-check />
				</div>
			</div>
		</template>
		<template v-else>
			<div class="upload-action">
				<div class="action-cancel" v-if="isUploading">
					<button @click="$emit('cancel')"><icon-times /></button>
				</div>
				<div class="action-cancelled" v-else-if="isCancelled">
					<button @click="$emit('retry')"><icon-clockwise /></button>
				</div>
				<div class="action-locate" v-else-if="isComplete">
					<button @click="$emit('locate')"><icon-folder-open /></button>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import { ref } from 'vue';
import ProgressRing from './ProgressRing.vue';
import useUploadStates from '../../../composable/upload-states';
import IconCheck from '../../icons/IconCheck.vue';

export default {
	components: { ProgressRing, IconCheck },
	emits: ['cancel', 'retry', 'locate'],
	props: {
		item: {
			type: Object,
			required: true,
		},
	},
	setup(props) {
		const hovered = ref(false);

		return { hovered, ...useUploadStates(props.item) };
	},
};
</script>

<style scoped>
.upload-controls,
.upload-action,
.action-cancel,
.action-cancelled,
.action-complete,
.action-locate {
	display: flex;
	justify-content: center;
	align-items: center;
}
.upload-controls {
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease;
}
.upload-controls:hover {
	background-color: #d9d9d9;
	fill: white;
}
.upload-controls button {
	background: transparent;
	padding: 0;
	border: none;
}
.upload-action,
.upload-controls button {
	width: 32px;
	height: 32px;
}
.action-cancel,
.action-cancelled,
.action-complete,
.action-locate {
	width: 70%;
	height: 70%;
	border-radius: 50%;
}
.action-cancel {
	background-color: #333;
}
.action-cancelled {
	background-color: #dc3545;
}
.action-complete {
	background-color: #28a745;
}
.action-locate {
	position: relative;
	background-color: #d9d9d9;
}
.upload-action svg {
	width: 70%;
	height: 70%;
	color: #fff;
}
</style>
