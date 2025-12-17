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

<div class="flex h-screen w-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans">
	<!-- Sidebar -->
	<aside
		class="w-[450px] flex flex-col h-full bg-white border-r border-neutral-200 shadow-xl z-20 shrink-0 relative"
	>
		<!-- Header / Search Area -->
		<div class="p-4 border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
			<h1 class="text-xl font-bold text-neutral-800 mb-4 tracking-tight">{title}</h1>

			<form {onsubmit} class="flex flex-col gap-3">
				<div class="relative group">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg
							class="h-5 w-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<input
						required
						type="text"
						name="search"
						placeholder="Search for places..."
						class="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-lg leading-5 bg-neutral-50 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
					/>
				</div>

				<input type="hidden" name="nextPageToken" value={nextPageToken} />

				<div class="flex gap-2">
					<button
						type="submit"
						disabled={loading}
						class="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
					>
						{#if loading}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Searching...
						{:else}
							Search
						{/if}
					</button>

					<a
						href={resolve('/show')}
						class="flex items-center justify-center px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200 transition-all"
						title="View Table Details"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 13.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 13.875c0 .621.504 1.125 1.125 1.125M12 16.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 16.5c0 .621.504 1.125 1.125 1.125"
							/>
						</svg>
					</a>
				</div>
			</form>
		</div>

		<!-- Results Area -->
		<div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-neutral-50/50">
			{#if loading}
				<div class="flex flex-col items-center justify-center py-10 opacity-60">
					<p class="text-sm text-neutral-500 animate-pulse">Fetching places...</p>
				</div>
			{:else if places.length === 0}
				<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
					<div class="bg-neutral-100 p-4 rounded-full mb-3 text-neutral-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
							/>
						</svg>
					</div>
					<p class="text-neutral-900 font-medium">No places found</p>
					<p class="text-neutral-500 text-sm mt-1">
						Try searching for a different location or category.
					</p>
				</div>
			{/if}

			{#if places.length > 0}
				<div class="flex items-center justify-between px-1 pb-1">
					<p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
						Results ({places.length})
					</p>
				</div>

				{#each places as place (place.id)}
					<PlaceCard {place} />
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Map Area -->
	<main class="flex-1 relative h-full">
		<Maps {apiKey} mapId={PUBLIC_MAP_ID} {places} bind:neCorner bind:swCorner />
	</main>
</div>
