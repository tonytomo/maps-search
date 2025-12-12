<script lang="ts">
	import { PUBLIC_MAP_ID, PUBLIC_MAPS_API_KEY } from '$env/static/public';
	import Maps from '$lib/components/ui/maps.svelte';
	import PlaceCard from '$lib/components/ui/place-card.svelte';
	import type { PlaceAPIResponse, Place } from '$lib/types/maps.type';
	import { getPlacesInfo } from '$lib/utils/maps.util.js';

	const title = 'This is a real life';

	const apiKey = PUBLIC_MAPS_API_KEY;

	let loading = $state(false);
	let radius = $state(10000);
	let places = $state<Place[]>([]);
	let nextPageToken = $state('');

	let clickedLat: number = $state(-7.549);
	let clickedLng: number = $state(110.735);
	let isMarked: boolean = $state(false);

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();

		loading = true;

		const form = new FormData(event.target as HTMLFormElement);
		const payload = {
			latitude: Number(form.get('latitude') as string),
			longitude: Number(form.get('longitude') as string),
			radius: Number(form.get('radius') as string),
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

<Maps {apiKey} mapId={PUBLIC_MAP_ID} bind:clickedLat bind:clickedLng bind:isMarked />

{#if isMarked}
	<form {onsubmit} class="absolute top-4 right-4 bg-white w-64 flex flex-col gap-2 p-4">
		<input required type="text" name="search" placeholder="Search" />
		<input required type="hidden" name="latitude" placeholder="Latitude" value={clickedLat} />
		<input required type="hidden" name="longitude" placeholder="Longitude" value={clickedLng} />
		<div class="flex flex-row gap-2">
			<input
				required
				type="range"
				min="5000"
				max="50000"
				step="1000"
				name="radius"
				bind:value={radius}
			/>
			<span>{radius}</span>
		</div>

		<button type="submit">Submit</button>
	</form>

	<div class="absolute bottom-0 w-full bg-white p-4 flex flex-col gap-2 h-[20vh] overflow-y-auto">
		{#if loading}
			<p>Loading...</p>
		{/if}

		{#if !loading && places.length === 0}
			<p>No places found</p>
		{/if}

		<div class="flex flex-col gap-2">
			{#if places.length > 0}
				{#each places as place (place.id)}
					<PlaceCard {place} />
				{/each}
			{/if}
		</div>
	</div>
{/if}
