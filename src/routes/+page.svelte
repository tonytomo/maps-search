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

	let clickedLat: number | null = $state(null);
	let clickedLng: number | null = $state(null);

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

<h1>Test Maps</h1>

<Maps {apiKey} mapId={PUBLIC_MAP_ID} bind:clickedLat bind:clickedLng />

<hr />

<h1>Test API</h1>

<form {onsubmit} class="flex flex-col gap-2">
	<input required type="text" name="search" placeholder="Search" />
	<input required type="hidden" name="latitude" placeholder="Latitude" value={clickedLat} />
	<input required type="hidden" name="longitude" placeholder="Longitude" value={clickedLng} />
	<div class="flex flex-row gap-2">
		<input
			required
			type="range"
			min="0"
			max="50000"
			step="1000"
			name="radius"
			bind:value={radius}
		/>
		<span>{radius}</span>
	</div>

	<button type="submit">Submit</button>
</form>

{#if loading}
	<p>Loading...</p>
{/if}

{#if !loading && places.length === 0}
	<p>No places found</p>
{/if}

{#if places.length > 0}
	{#each places as place (place.id)}
		<PlaceCard {place} />
	{/each}
{/if}

<hr />

<h1>Todos:</h1>
<ul class="pl-4 list-decimal">
	<li>000Init project</li>
	<li>000Set the api key</li>
	<li>000Create api response and modified types</li>
	<li>000Set up the api request</li>
	<li>000Test the api</li>
	<li>000Create simple table to display</li>
	<li>000Embed Google Maps</li>
	<li>000Make function to get the latitude and longitude when click on maps</li>
	<li>000Make simple form with search and radius input</li>
</ul>
