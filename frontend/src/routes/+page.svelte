<script lang="ts">
	import Collection from '$lib/components/collection.svelte';
	import { getData } from '../utils/jsondb';

	let collections: CollectionType[] = getData();
</script>

<div class="container h-full mx-auto py-4">
	{#each collections as item, idx}
		<Collection href={'/' + idx} title={item.title} />
	{/each}

	<div class="flex flex-col items-center">
		<button class="card variant-filled-primary p-2 w-1/3">Add Collection</button>
	</div>
</div>
