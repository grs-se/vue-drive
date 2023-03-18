<template>
	<div class="col-md-3">
		<!-- parent scope attribute bindings and events that are not recongised as custom props or events -->
		<div class="card mb-4" v-bind="$attrs">
			<div class="card-body">
				<div class="d-flex align-items-center">
					<icon-folder />
					<span class="file-name">{{ folder.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	inheritAttrs: false,
	props: {
		folder: {
			type: Object,
			required: true,
		},
	},
};
</script>
