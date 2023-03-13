<template>
	<form @submit.prevent="handleSubmit">
		<input type="text" class="form-control" v-model="name" />
		<div class="d-flex flex-row-reverse mt-3">
			<button class="btn btn-primary" type="submit">OK</button>
			<button
				class="btn btn-outline-secondary me-2"
				@click.prevent="$emit('close')"
			>
				Cancel
			</button>
		</div>
	</form>
</template>

<script>
import files from '../../api/files';
import filesApi from '../../api/files';
export default {
	props: {
		file: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			name: this.file.name,
		};
	},
	methods: {
		async handleSubmit() {
			try {
				const { data } = await filesApi.update(
					{ ...this.file, name: this.name },
					this.file.id
				);
				this.$emit('file-updated', data);
				this.$emit('close');
			} catch (error) {
				console.error(error);
			}
		},
	},
	emits: ['file-updated', 'close'],
};
</script>
