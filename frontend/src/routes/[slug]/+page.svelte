<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import Test from '$lib/components/test.svelte';
	import { getData } from '../../utils/jsondb';
	import { page } from '$app/stores';

	const slug = parseInt($page.params.slug);
	let groups: GroupItemType[] = getData()[slug].groups;

	const onclick = () => {};
</script>

<div class="container h-full mx-auto py-4">
	<Accordion autocollapse>
		{#each groups as group, idx}
			<AccordionItem open={idx === 0 ? true : false}>
				<svelte:fragment slot="lead">{group.lead}</svelte:fragment>
				<svelte:fragment slot="summary">{group.summary}</svelte:fragment>
				<svelte:fragment slot="content">
					{#each group.tests as test}
						<Test requestType={test.requestType} url={test.url} onClick={onclick} />
					{/each}

					<div class="flex flex-col items-center">
						<button class="card variant-filled-primary p-2 w-1/3">Add Test</button>
					</div>
				</svelte:fragment>
			</AccordionItem>
		{/each}

		<div class="flex flex-col items-center">
			<button class="card variant-filled-primary p-2 w-1/3">Add Group</button>
		</div>
	</Accordion>
</div>
