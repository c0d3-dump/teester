<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	export let requestType: string;
	export let url: string;
	export let onClick: Function;
	export let progressStatus: string = '';
</script>

<button on:click={onClick()} class="flex card p-4 text-left card-hover my-4 w-full">
	<div class="badge variant-filled-primary w-20">{requestType}</div>
	<div class="mx-4 w-full">{url}</div>

	{#if progressStatus === 'success'}
		<div class="badge variant-filled-success">succeed</div>
	{:else if progressStatus === 'fail'}
		<div class="badge variant-filled-error">failed</div>
	{:else if progressStatus === 'loading'}
		<ProgressRadial
			width="w-6"
			stroke={150}
			meter="stroke-primary-500"
			track="stroke-primary-500/30"
		/>
	{/if}
</button>
