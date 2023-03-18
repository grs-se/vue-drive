<template>
	<div class="container py-3">
		<ActionBar
			:selected-count="selectedItems.length"
			@remove="handleRemove"
			@rename="showModal = true"
			@files-chosen="chosenFiles = $event"
		/>

		<div class="d-flex justify-content-between align-items-center py-2">
			<h6 class="text-muted mb-0">Files</h6>
			<SortToggler @sort-change="handleSortChange($event)" />
		</div>

		<teleport to="#search-form">
			<SearchForm v-model="q" />
		</teleport>

		<DropZone
			@files-dropped="chosenFiles = $event"
			:show-message="!files.length"
		>
			<FoldersList
				:folders="folders"
				@select-change="handleSelectChange($event)"
				:selected="selectedItems"
			/>
			<FilesList
				:files="files"
				@select-change="handleSelectChange($event)"
				:selected="selectedItems"
			/>
		</DropZone>

		<app-toast
			:show="toast.show"
			:message="toast.message"
			type="success"
			position="bottom-left"
			@hide="toast.show = false"
		/>

		<app-modal
			title="Rename"
			:show="showModal && selectedItems.length === 1"
			@hide="showModal = false"
		>
			<FileRenameForm
				:file="selectedItems[0]"
				@close="showModal = false"
				@file-updated="handleFileUpdated($event)"
			/>
		</app-modal>
		<UploaderPopup
			:files="chosenFiles"
			@upload-complete="handleUploadComplete"
		/>
	</div>
</template>

<script>
import filesApi from '../api/files';
import foldersApi from '../api/folders';
import ActionBar from '../components/ActionBar.vue';
import SearchForm from '../components/SearchForm.vue';
import SortToggler from '../components/SortToggler.vue';
import FilesList from '../components/files/FilesList.vue';
import FoldersList from '../components/files/FoldersList.vue';
import FileRenameForm from '../components/files/FileRenameForm.vue';
import DropZone from '../components/uploader/file-chooser/DropZone.vue';
import UploaderPopup from '../components/uploader/popup/UploaderPopup.vue';
import { ref, reactive, watchEffect, toRef, provide } from 'vue';

const getPath = (query) => {
	let folderPath = 'folders';
	let filePath = 'files';

	if (query.folderId > 0) {
		const basePath = `folders/${query.folderId}`;
		folderPath = `${basePath}/${folderPath}`;
		filePath = `${basePath}/${filePath}`;
	}

	return { folderPath, filePath };
};

const fetchFoldersAndFiles = async (query) => {
	try {
		const { folderPath, filePath } = getPath(query);
		const { data: folders } = await foldersApi.index(query);
		const { data: files } = await filesApi.index(query);
		return { folders: folders, files: files };
	} catch (error) {
		console.error(error);
	}
};

const removeItem = async (item, files) => {
	try {
		const response = await filesApi.delete(item.id);
		if (response.status === 200 || response.status === 204) {
			const index = files.value.findIndex((file) => file.id === item.id);
			files.value.splice(index, 1);
		}
	} catch (error) {
		console.error(error);
	}
};

export default {
	components: {
		ActionBar,
		FilesList,
		FoldersList,
		SortToggler,
		SearchForm,
		FileRenameForm,
		DropZone,
		UploaderPopup,
	},
	setup() {
		const files = ref([]);
		const folders = ref([]);
		const query = reactive({
			_sort: 'name',
			_order: 'asc',
			q: '',
			folderId: 0,
		});
		const selectedItems = ref([]);
		const toast = reactive({
			show: false,
			message: '',
		});
		const showModal = ref(false);
		const chosenFiles = ref([]);

		const handleSelectChange = (items) => {
			selectedItems.value = Array.from(items);
		};

		provide('setSelectedItem', handleSelectChange);

		const handleSortChange = (payload) => {
			query._sort = payload.column;
			query._order = payload.order;
		};

		const handleRemove = () => {
			if (confirm('Are you sure?')) {
				selectedItems.value.forEach((item) => removeItem(item, files));
				selectedItems.value.splice(0);
				toast.show = true;
				toast.message = 'Selected item(s) successfully removed';
			}
		};

		const handleFileUpdated = (file) => {
			const oldFile = selectedItems.value[0];
			const index = files.value.findIndex((item) => item.id === file.id);
			files.value.splice(index, 1, file);
			toast.show = true;
			toast.message = `File '${oldFile.name}' renamed to '${file.name}'`;
		};

		const handleUploadComplete = (item) => {
			files.value.push(item);
		};
		// watchEffect immediately calls the cb inside fetchFoldersAndFiles whenever the reactive variables inside the cb change.
		watchEffect(async () => {
			const response = await fetchFoldersAndFiles(query);
			files.value = response.files;
			folders.value = response.folders;
		});

		return {
			files,
			folders,
			handleSortChange,
			q: toRef(query, 'q'),
			handleSelectChange,
			selectedItems,
			handleRemove,
			toast,
			showModal,
			handleFileUpdated,
			chosenFiles,
			handleUploadComplete,
		};
	},
};
</script>
