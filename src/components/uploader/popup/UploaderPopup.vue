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
			<UploaderControls
				:items="items"
				@cancel="cancelUploadingItems"
				@retry="reuploadCancelledItems"
			/>
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
import UploaderControls from './UploaderControls.vue';
import UploadItem from '../item/UploadItem.vue';
import { computed, ref, watch } from 'vue';
import states from '../states';
import useUploadStatistics from '../../../composables/upload-statistics';

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

export default {
	props: {
		files: {
			type: Object,
			required: true,
		},
	},
	components: { PopupControls, UploadItem, UploaderControls },
	setup(props, { emit }) {
		const items = ref([]);
		const showPopupBody = ref(true);

		const handleClose = () => {
			const { uploadingItemsCount } = useUploadStatistics(items);
			if (uploadingItemsCount > 0) {
				if (confirm('Cancel all uploads?')) {
					cancelUploadingItems();
					items.value.splice(0);
				}
			} else {
				items.value.splice(0);
			}
		};

		const uploadingStatus = computed(() => {
			const { uploadingItemsCount, failedItemsCount, completeItemsCount } =
				useUploadStatistics(items);
			if (uploadingItemsCount > 0) {
				return `Uploading ${uploadingItemsCount} items`;
			} else if (completeItemsCount > 0) {
				return `${completeItemsCount} uploads complete`;
			} else if (failedItemsCount > 0) {
				return `${failedItemsCount} uploads failed`;
			}
		});

		const handleItemChange = (item) => {
			if (item.state === states.COMPLETE) {
				emit('upload-complete', item.response);
				const index = items.value.findIndex((i) => i.id === item.id);
				items.value.splice(index, 1, item);
			}
		};

		const cancelUploadingItems = () => {
			items.value.map((item) => {
				if (item.state === states.WAITING || item.state === states.UPLOADING) {
					item.state = states.CANCELLED;
					item.progress = 0;
				}
				return item;
			});
		};

		const reuploadCancelledItems = () => {
			items.value.map((item) => {
				if (item.state === states.CANCELLED) {
					item.state = states.WAITING;
					item.progress = 0;
				}
				return item;
			});
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
			cancelUploadingItems,
			reuploadCancelledItems,
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
