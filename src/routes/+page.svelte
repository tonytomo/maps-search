<script lang="ts">
	import { resolve } from '$app/paths';
	import { PUBLIC_MAP_ID, PUBLIC_MAPS_API_KEY } from '$env/static/public';
	import Maps from '$lib/components/ui/maps.svelte';
	import PlaceCard from '$lib/components/ui/place-card.svelte';
	import type { PlaceAPIResponse, Place, Coordinate } from '$lib/types/maps.type';
	import { getPlacesInfo } from '$lib/utils/maps.util.js';
	import { onMount } from 'svelte';

	const title = 'Find business from google maps';

	const apiKey = PUBLIC_MAPS_API_KEY;

	let loading = $state(false);
	let places = $state<Place[]>([]);
	let nextPageToken = $state('');

	let neCorner: Coordinate = $state({
		latitude: 0,
		longitude: 0
	});
	let swCorner: Coordinate = $state({
		latitude: 0,
		longitude: 0
	});

	onMount(() => {
		const resultJson = localStorage.getItem('curr');
		if (resultJson) {
			const result = JSON.parse(resultJson) as { places: Place[] };
			places = result.places;
		}
	});

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();

		loading = true;

		const form = new FormData(event.target as HTMLFormElement);
		const payload = {
			latitude: Number(form.get('latitude') as string),
			longitude: Number(form.get('longitude') as string),
			neCorner,
			swCorner,
			search: form.get('search') as string
		};

		const data: PlaceAPIResponse | null = await getPlacesInfo(payload);
		if (data) {
			places = data.places;
			nextPageToken = data.nextPageToken;
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="flex w-screen h-screen">
	<div class="max-w-md bg-white flex flex-col p-2 gap-2 shadow-lg">
		<form {onsubmit} class="flex flex-col gap-2">
			<input
				required
				type="text"
				name="search"
				placeholder="Search"
				class="shadow-inner p-2 bg-blue-100"
			/>
			<input type="hidden" name="nextPageToken" value={nextPageToken} />

			<button
				type="submit"
				disabled={loading}
				class="cursor-pointer py-2 bg-blue-500 text-white disabled:bg-neutral-200 disabled:text-neutral-500"
			>
				{#if loading}
					Loading
				{:else}
					Submit
				{/if}
			</button>

			<a href={resolve('/show')} class="p-2 bg-green-500 flex justify-between">
				<p>See table details</p>
				<p>-></p>
			</a>
		</form>

		<div class="flex flex-col gap-2 h-full overflow-y-auto">
			{#if loading}
				<p>Loading...</p>
			{/if}

			{#if !loading && places.length === 0}
				<p>No places found</p>
			{/if}

			<div class="flex flex-col gap-2">
				{#if places.length > 0}
					<p class="p-2 bg-neutral-300">
						{places.length} places found.
					</p>
					{#each places as place (place.id)}
						<PlaceCard {place} />
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<Maps {apiKey} mapId={PUBLIC_MAP_ID} {places} bind:neCorner bind:swCorner />
</div>
