<template>
	<div class="dropzone-message-wrapper">
		<div class="dropzone-message">
			<icon-cloud-arrow-up class="dropzone-icon" />
			<p class="main-message">Drop files here</p>
			<div class="alt-message">or use the "Upload Files" button</div>
		</div>
	</div>
</template>

<style scoped>
.dropzone-message-wrapper {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	margin-top: 4rem;
}
</style>
