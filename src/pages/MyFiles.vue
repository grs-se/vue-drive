<template>
	<div class="container py-3">
		<ActionBar
			:selected-count="selectedItems.length"
			@remove="handleRemove"
			@rename="showModal = true"
		/>

		<div class="d-flex justify-content-between align-items-center py-2">
			<h6 class="text-muted mb-0">Files</h6>
			<SortToggler @sort-change="handleSortChange($event)" />
		</div>
		<teleport to="#search-form"> <SearchForm v-model="q" /> </teleport
		><FilesList :files="files" @select-change="handleSelectChange($event)" />
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
			<FileRenameForm :file="selectedItems[0]" @close="showModal = false" />
		</app-modal>
	</div>
</template>

<script>
import { reactive, ref, watchEffect, toRef } from 'vue';
import files from '../api/files';
import filesApi from '../api/files';
import ActionBar from '../components/ActionBar.vue';
import FilesList from '../components/files/FilesList.vue';
import SearchForm from '../components/SearchForm.vue';
import SortToggler from '../components/SortToggler.vue';
import FileRenameForm from '../components/files/FileRenameForm.vue';

const fetchFiles = async (query) => {
	try {
		const { data } = await filesApi.index(query);
		return data;
	} catch (error) {
		console.log(error);
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
	components: { ActionBar, FilesList, SortToggler, SearchForm, FileRenameForm },
	setup() {
		const files = ref([]);
		const query = reactive({
			_sort: 'name',
			_order: 'asc',
			q: '',
		});
		const selectedItems = ref([]);
		const toast = reactive({
			show: false,
			message: '',
		});
		const showModal = ref(false);

		const handleSelectChange = (items) => {
			selectedItems.value = Array.from(items);
		};

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

		watchEffect(async () => (files.value = await fetchFiles(query)));
		// watch(
		// 	() => query._order,
		// 	async () => (files.value = await fetchFiles(query)),
		// 	{ immediate: true }
		// );

		return {
			files,
			handleSortChange,
			q: toRef(query, 'q'),
			selectedItems,
			handleSelectChange,
			handleRemove,
			toast,
			showModal,
		};
	},
};
</script>
