<script lang="ts">
	import type { Place } from '$lib/types/maps.type';
	import { onMount } from 'svelte';

	export let place: Place;

	let isSaved = false;

	// Use a reactive statement to check status whenever 'place' changes
	$: if (place) checkIsSaved();

	const socialLinks = [
		{ type: 'website', icon: '🔗', label: 'Website', value: place.website },
		{ type: 'facebook', icon: 'facebook', label: 'Facebook', value: place.facebook },
		{ type: 'instagram', icon: 'instagram', label: 'Instagram', value: place.instagram },
		{ type: 'email', icon: '📧', label: 'Email', value: place.email, hrefPrefix: 'mailto:' },
		{ type: 'phone', icon: '📞', label: 'Call', value: place.phoneNumber, hrefPrefix: 'tel:' }
	].filter((link) => link.value); // Only show links that exist

	// Helper to format currency
	const formatRupiah = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};

	function getStoragePlaces(): Place[] {
		if (typeof localStorage === 'undefined') return [];
		const placesJson = localStorage.getItem('savedPlaces');
		return placesJson ? JSON.parse(placesJson) : [];
	}

	function checkIsSaved() {
		const places = getStoragePlaces();
		isSaved = places.some((item) => item.id === place.id);
	}

	function toggleSave() {
		let places = getStoragePlaces();
		if (isSaved) {
			places = places.filter((item) => item.id !== place.id);
		} else {
			places = [place, ...places]; // Add to top
		}

		localStorage.setItem('savedPlaces', JSON.stringify(places));
		isSaved = !isSaved;
	}

	onMount(() => {
		checkIsSaved();
	});
</script>

<div
	class="group relative flex flex-col md:flex-row bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
>
	<!-- Image Section -->
	<div class="w-full md:w-48 h-48 md:h-auto shrink-0 bg-neutral-100 relative">
		{#if place.productPictureUrl}
			<img
				src={place.productPictureUrl}
				alt={place.productName || place.name}
				class="w-full h-full object-cover"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center text-4xl text-neutral-300">📍</div>
		{/if}

		<!-- Category Badge (Overlay on Mobile, normal on Desktop) -->
		<span
			class="absolute top-2 left-2 px-2 py-1 text-xs font-semibold bg-white/90 backdrop-blur text-neutral-800 rounded-md shadow-sm"
		>
			{place.productCategory}
		</span>
	</div>

	<!-- Content Section -->
	<div class="flex-1 p-4 flex flex-col gap-3">
		<div class="flex justify-between items-start gap-4">
			<div>
				<h3 class="font-bold text-lg text-neutral-900 leading-tight mb-1">{place.name}</h3>
				<p class="text-sm text-neutral-500">{place.address}</p>
			</div>

			<!-- Save Button -->
			<button
				on:click={toggleSave}
				class="shrink-0 p-2 rounded-full transition-colors duration-200 {isSaved
					? 'bg-red-50 text-red-500 hover:bg-red-100'
					: 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}"
				title={isSaved ? 'Remove from saved' : 'Save place'}
			>
				{#if isSaved}
					<!-- Filled Heart Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-6 h-6"
						><path
							d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
						/></svg
					>
				{:else}
					<!-- Outline Heart Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
						/></svg
					>
				{/if}
			</button>
		</div>

		<!-- Details Grid -->
		<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-1">
			{#if place.productPriceInRupiah}
				<div class="col-span-1 text-neutral-700">
					<span class="text-neutral-400 text-xs uppercase font-semibold">Price</span>
					<div class="font-medium text-emerald-600">{formatRupiah(place.productPriceInRupiah)}</div>
				</div>
			{/if}
			{#if place.capacity}
				<div class="col-span-1 text-neutral-700">
					<span class="text-neutral-400 text-xs uppercase font-semibold">Capacity</span>
					<div class="font-medium">{place.capacity} {place.capacityUnit}</div>
				</div>
			{/if}
		</div>

		<!-- Tags Plls -->
		{#if place.tags && place.tags.length > 0}
			<div class="flex flex-wrap gap-1.5 mt-auto pt-2">
				{#each place.tags as tag}
					<span
						class="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full border border-neutral-200"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Action Links -->
		{#if socialLinks.length > 0}
			<div class="flex flex-wrap gap-3 pt-3 border-t border-neutral-100">
				{#each socialLinks as link}
					<a
						href="{link.hrefPrefix || ''}{link.value}"
						target={link.hrefPrefix ? undefined : '_blank'}
						rel="noopener noreferrer"
						class="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-blue-600 transition-colors"
					>
						<span>{link.icon || '🔗'}</span>
						<!-- Clean up URL for display if it's a website -->
						{#if link.type === 'website'}
							Visit Website
						{:else}
							{link.label}
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
