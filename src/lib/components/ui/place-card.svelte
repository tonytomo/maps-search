<script lang="ts">
	import type { Place } from '$lib/types/maps.type';

	export let place: Place;

	let isSaved = checkPlace(place.id);

	const getSocialIcon = (platform: string): string => {
		switch (platform.toLowerCase()) {
			case 'facebook':
				return '📘'; // Placeholder emoji/icon
			case 'instagram':
				return '📸'; // Placeholder emoji/icon
			case 'website':
				return '🔗'; // Placeholder emoji/icon
			case 'email':
				return '📧'; // Placeholder emoji/icon
			case 'phone':
				return '📞'; // Placeholder emoji/icon
			default:
				return '📍';
		}
	};

	function checkPlace(id: string) {
		let places: Place[] = [];
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) places = JSON.parse(placesJson) as Place[];

		for (const item of places) {
			if (item.id === id) return true;
		}

		return false;
	}

	function savePlace(p: Place) {
		let places: Place[] = [];
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) places = JSON.parse(placesJson) as Place[];

		if (places.every((item) => item.id !== p.id)) places = [p, ...places];
		localStorage.setItem('savedPlaces', JSON.stringify(places));

		isSaved = checkPlace(p.id);
	}

	function removePlace(id: string) {
		let places: Place[] = [];
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) places = JSON.parse(placesJson) as Place[];

		const filteredPlaces = places.filter((item) => item.id !== id);
		localStorage.setItem('savedPlaces', JSON.stringify(filteredPlaces));

		isSaved = checkPlace(id);
	}
</script>

<div class="flex">
	<div
		class="size-full py-2 border-b border-neutral-200 flex flex-col gap-1 {isSaved
			? 'bg-green-200'
			: ''}"
	>
		<p class="font-bold">{place.name}</p>
		<div class="flex gap-2 flex-wrap">
			{#each place.tags as tag, i (i)}
				<p class="px-1 bg-blue-200 border border-blue-500">{tag}</p>
			{/each}
		</div>
		<p class="px-1 bg-green-200 border border-green-500 self-start">{place.province}</p>
		<p class="px-1 bg-orange-200 border border-orange-500 self-start">{place.productCategory}</p>
		<p class="text-neutral-600">{place.address}</p>
		{#if place.phoneNumber}
			<a
				href={`tel:${place.phoneNumber}`}
				class="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
			>
				{getSocialIcon('phone')} <span class="ml-2">Call: {place.phoneNumber}</span>
			</a>
		{/if}
		{#if place.website}
			<a
				href={`https://${place.website.slice(7)}`}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
			>
				{getSocialIcon('website')} <span class="ml-2">Website</span>
			</a>
		{/if}
	</div>

	<div class="flex flex-col justify-around">
		{#if isSaved}
			<button
				on:click={() => removePlace(place.id)}
				class="cursor-pointer p-2 bg-red-500 text-white"
			>
				Remove
			</button>
		{:else}
			<button on:click={() => savePlace(place)} class="cursor-pointer p-2 bg-blue-500 text-white">
				Save
			</button>
		{/if}
	</div>
</div>
