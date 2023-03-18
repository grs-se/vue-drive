<template>
	<div class="row" @click="clearSelected">
		<FolderItem
			v-for="folder in folders"
			:folder="folder"
			:key="`folder-${folder.id}`"
			@click.exact.stop="selectOne(folder)"
			@click.ctrl.exact.stop="selectMultiple(folder)"
			:class="{ 'selected-folder': isSelected(folder) }"
		/>
	</div>
</template>

<script>
import { reactive } from 'vue';
import FolderItem from './FolderItem.vue';

export default {
	components: { FolderItem },
	props: {
		folders: {
			type: Array,
			required: true,
		},
		selected: { type: Array, default: () => [] },
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

		const isSelected = (item) =>
			selectedItems.has(item) ||
			(props.selected.length && props.selected[0].id === item.id);

		const clearSelected = () => {
			selectedItems.clear();
			emit('select-change', selectedItems);
		};

		return { selectOne, selectMultiple, isSelected, clearSelected };
	},
	emits: ['select-change'],
};
</script>
