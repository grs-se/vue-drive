import states from '../components/uploader/states';
import { computed } from 'vue';

const useUploadStates = (item) => {
	const isCancelled = computed(() => item.state === states.CANCELLED);
	const isUploading = computed(
		() => item.state === states.WAITING || item.state === states.UPLOADING
	);
	const isFailed = computed(() => item.state === states.FAILED);
	const isComplete = computed(() => item.state === states.COMPLETE);

	return { isCancelled, isUploading, isFailed, isComplete };
};

export default useUploadStates;
