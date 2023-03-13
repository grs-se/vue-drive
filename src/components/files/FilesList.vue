<template>
	<div class="row" @click="clearSelected">
		<FileItem
			v-for="file in files"
			:file="file"
			:key="`file-${file.id}`"
			@click.exact.stop="selectOne(file)"
			@click.ctrl.exact.stop="selectMultiple(file)"
			:class="{ 'selected-file': isSelected(file) }"
		/>
	</div>
</template>

<script>
import { reactive } from 'vue';
import FileItem from './FileItem.vue';
export default {
	components: { FileItem },
	props: {
		files: {
			type: Array,
			required: true,
		},
	},
	setup(props, { emit }) {
		const selectedItems = reactive(new Set());

		const selectOne = (item) => {
			selectedItems.clear();
			selectedItems.add(item);
			emit('select-change', selectedItems);
		};

		const selectMultiple = (item) => {
			if (selectedItems.has(item)) {
				selectedItems.delete(item);
			} else {
				selectedItems.add(item);
			}
			emit('select-change', selectedItems);
		};

		const isSelected = (item) => selectedItems.has(item);

		const clearSelected = () => {
			selectedItems.clear();
			emit('select-change', selectedItems);
		};

		return { selectOne, selectMultiple, isSelected, clearSelected };
	},
	emits: ['select-change'],
};
</script>
