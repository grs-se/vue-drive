<template>
	<div class="card shadow uploader-popup" v-if="items.length">
		<div class="card-header bg-dark py-3">
			<div class="d-flex justify-content-between align-items-center">
				<span class="text-light">{{ uploadingStatus }}</span>
				<PopupControls
					@toggle="showPopupBody = !showPopupBody"
					@close="handleClose"
				/>
			</div>
		</div>
		<div class="upload-items" v-show="showPopupBody">
			<div
				class="bg-light py-2 px-3 d-flex justify-content-between align-items-center border-bottom"
			>
				<span class="text-secondary">{{ overallProgress }}% complete</span>
				<a href="" class="text-decoration-none">CANCEL</a>
			</div>
			<ul class="list-group list-group-flush">
				<UploadItem
					v-for="item in items"
					:key="`item-${item.id}`"
					:item="item"
					@change="handleItemChange"
				/>
			</ul>
		</div>
	</div>
</template>

<script>
import PopupControls from './PopupControls.vue';
import UploadItem from '../item/UploadItem.vue';
import { computed, ref, watch } from 'vue';
import states from '../states';

const randomId = () => {
	return Math.random().toString(36).substr(2, 9);
};

const getUploadItems = (files) => {
	return Array.from(files).map((file) => ({
		id: randomId(),
		file,
		progress: 0,
		state: states.WAITING,
		response: null,
	}));
};

const uploadStatistics = (items) => {
	const uploadingItemsCount = computed(() => {
		return items.value.filter(
			(item) => item.state === states.WAITING || item.state === states.UPLOADING
		).length;
	}).value;

	const failedItemsCount = computed(() => {
		return items.value.filter(
			(item) => item.state === states.CANCELLED || item.state === states.FAILED
		).length;
	}).value;

	const processingItems = computed(() => {
		return items.value.filter(
			(item) => item.state !== states.CANCELLED || item.state !== states.FAILED
		);
	});

	const processingItemsCount = processingItems.value.length;

	const processingItemsProgress = processingItems.value.reduce(
		(total, item) => total + item.progress,
		0
	);

	const completeItemsCount = computed(
		() => items.value.filter((item) => item.state === states.COMPLETE).length
	).value;

	return {
		uploadingItemsCount,
		completeItemsCount,
		failedItemsCount,
		processingItemsCount,
		processingItemsProgress,
	};
};

export default {
	props: {
		files: {
			type: Object,
			required: true,
		},
	},
	components: { PopupControls, UploadItem },
	setup(props, { emit }) {
		const items = ref([]);
		const showPopupBody = ref(true);

		const handleClose = () => {
			if (confirm('Cancel all uploads?')) {
				items.value.splice(0);
			}
		};

		const uploadingStatus = computed(() => {
			const { uploadingItemsCount, failedItemsCount, completeItemsCount } =
				uploadStatistics(items);
			if (uploadingItemsCount > 0) {
				return `Uploading ${uploadingItemsCount} items`;
			} else if (completeItemsCount > 0) {
				return `${completeItemsCount} uploads complete`;
			} else if (failedItemsCount > 0) {
				return `${failedItemsCount} uploads failed`;
			}
		});

		const overallProgress = computed(() => {
			const { processingItemsCount, processingItemsProgress } =
				uploadStatistics(items);

			if (processingItemsCount < 1) {
				return 0;
			}

			return Math.round(processingItemsProgress / processingItemsCount);
		});

		const handleItemChange = (item) => {
			if (item.state === states.COMPLETE) {
				emit('upload-complete', item.response);
				const index = items.value.findIndex((i) => i.id === item.id);
				items.value.splice(index, 1, item);
			}
		};

		watch(
			() => props.files,
			(newFiles) => {
				items.value.unshift(...getUploadItems(newFiles));
			}
		);

		return {
			items,
			uploadingStatus,
			showPopupBody,
			handleClose,
			handleItemChange,
			overallProgress,
		};
	},
	emits: ['upload-complete'],
};
</script>

<style scoped>
.uploader-popup {
	width: 400px;
	position: fixed;
	bottom: 20px;
	right: 20px;
	z-index: 999;
}
</style>
