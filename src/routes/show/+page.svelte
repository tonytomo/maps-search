<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Place } from '$lib/types/maps.type';
	import { onMount } from 'svelte';

	let places: Place[] = $state([]);
	let searchQuery = $state('');

	type SortConfig = {
		key: keyof Place | null;
		direction: 'asc' | 'desc';
	};

	let sortConfig: SortConfig = $state({
		key: null,
		direction: 'asc'
	});

	onMount(() => {
		loadPlaces();
	});

	function loadPlaces() {
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) places = JSON.parse(placesJson);
	}

	function removePlace(id: string) {
		if (!confirm('Are you sure you want to remove this place?')) return;

		const filteredPlaces = places.filter((item) => item.id !== id);
		localStorage.setItem('savedPlaces', JSON.stringify(filteredPlaces));
		places = filteredPlaces;
	}

	function removeAllPlaces() {
		if (!confirm('Are you sure you want to delete ALL saved places? This cannot be undone.'))
			return;

		localStorage.setItem('savedPlaces', JSON.stringify([]));
		places = [];
	}

	const tableColumns: { k: keyof Place; l: string }[] = [
		{ k: 'name', l: 'Name' },
		{ k: 'address', l: 'Address' },
		{ k: 'regency', l: 'City/Regency' },
		{ k: 'productCategory', l: 'Category' },
		{ k: 'productPriceInRupiah', l: 'Price' },
		{ k: 'capacity', l: 'Capacity' },
		{ k: 'phoneNumber', l: 'Phone' },
		{ k: 'website', l: 'Website' },
		{ k: 'email', l: 'Email' }
	];

	function handleSort(key: keyof Place) {
		if (sortConfig.key === key) {
			sortConfig = {
				key,
				direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
			};
		} else {
			sortConfig = {
				key,
				direction: 'asc'
			};
		}
	}

	// Derived state for filtered and sorted places
	let filteredPlaces = $derived.by(() => {
		let result = [...places];

		// Filter
		if (searchQuery) {
			const lowerQuery = searchQuery.toLowerCase();
			result = result.filter((place) =>
				Object.values(place).some((val) => String(val).toLowerCase().includes(lowerQuery))
			);
		}

		// Sort
		if (sortConfig.key) {
			result.sort((a, b) => {
				const aVal = a[sortConfig.key!] ?? '';
				const bVal = b[sortConfig.key!] ?? '';

				if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	});

	function copyToClipboard() {
		// Define headers matching the visible table or all useful fields
		const headers: (keyof Place)[] = [
			'name',
			'description',
			'address',
			'regency',
			'province',
			'productName',
			'productDescription',
			'productCategory',
			'productPriceInRupiah',
			'capacity',
			'legality',
			'productPictureUrl',
			'phoneNumber',
			'website',
			'facebook',
			'instagram',
			'email'
		];

		const headerRow = headers.join('\t');
		const rows = filteredPlaces
			.map((place) => {
				return headers
					.map((key) => {
						let val = place[key] ?? '';
						// Clean up newlines or tabs in data to prevent breaking the TSV structure
						return String(val)
							.replace(/(\r\n|\n|\r)/gm, ' ')
							.replace(/\t/g, ' ');
					})
					.join('\t');
			})
			.join('\n');

		const text = `${headerRow}\n${rows}`;

		navigator.clipboard
			.writeText(text)
			.then(() => {
				alert('Data copied to clipboard! You can paste it into Excel or Google Sheets.');
			})
			.catch((err) => {
				console.error('Failed to copy: ', err);
				alert('Failed to copy to clipboard.');
			});
	}

	const formatRupiah = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};
</script>

<div class="min-h-screen bg-neutral-50 font-sans text-neutral-900">
	<!-- Navbar / Header -->
	<header class="bg-white border-b border-neutral-200 sticky top-0 z-20">
		<div class="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<a
					href={resolve('/')}
					class="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
					title="Back to Map"
				>
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
							d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
						/></svg
					>
				</a>
				<h1 class="text-lg font-bold">
					Saved Places <span class="text-neutral-400 font-normal ml-1">({places.length})</span>
				</h1>
			</div>

			<div class="flex-1 max-w-md hidden md:block">
				<div class="relative group">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg
							class="h-4 w-4 text-neutral-400"
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
						type="text"
						bind:value={searchQuery}
						placeholder="Filter results..."
						class="block w-full pl-9 pr-3 py-1.5 border border-neutral-200 rounded-md leading-5 bg-neutral-100 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
					/>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<button
					onclick={copyToClipboard}
					class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-4 h-4"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5"
						/></svg
					>
					Copy Data
				</button>
				<button
					onclick={() => window.print()}
					class="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
					title="Print"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.198-.54-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
						/></svg
					>
				</button>
				<div class="h-6 w-px bg-neutral-300"></div>
				<button
					onclick={removeAllPlaces}
					class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
					title="Reset All"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
						/></svg
					>
				</button>
			</div>
		</div>

		<!-- Mobile Search (only visible on small screens) -->
		<div class="md:hidden px-4 pb-3">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Filter results..."
				class="block w-full px-3 py-2 border border-neutral-200 rounded-md bg-neutral-100 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</div>
	</header>

	<main class="max-w-[1400px] mx-auto p-4 md:p-6">
		<div
			class="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
		>
			{#if filteredPlaces.length === 0}
				<div class="p-12 text-center flex flex-col items-center text-neutral-500">
					{#if places.length === 0}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-12 h-12 mb-3 text-neutral-300"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
							/></svg
						>
						<h3 class="text-lg font-medium text-neutral-900">No saved places yet</h3>
						<p class="max-w-sm mt-1">Go back to the map to search and save some businesses.</p>
						<a
							href={resolve('/')}
							class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>Go to Map</a
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-12 h-12 mb-3 text-neutral-300"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/></svg
						>
						<p>No results found for "{searchQuery}"</p>
					{/if}
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left whitespace-nowrap">
						<thead
							class="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-200"
						>
							<tr>
								<!-- Header Helper -->
								{#each tableColumns as col}
									<th
										scope="col"
										class="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors group select-none"
										onclick={() => handleSort(col.k)}
									>
										<div class="flex items-center gap-1">
											{col.l}
											<div class="flex flex-col text-[8px] text-neutral-400">
												<span
													class:text-neutral-800={sortConfig.key === col.k &&
														sortConfig.direction === 'asc'}>▲</span
												>
												<span
													class:text-neutral-800={sortConfig.key === col.k &&
														sortConfig.direction === 'desc'}>▼</span
												>
											</div>
										</div>
									</th>
								{/each}
								<th scope="col" class="px-6 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredPlaces as place (place.id)}
								<tr
									class="bg-white border-b border-neutral-100 hover:bg-blue-50/50 transition-colors last:border-0 odd:bg-white even:bg-neutral-50/30"
								>
									<td class="px-6 py-3 font-medium text-neutral-900">
										<div class="flex flex-col">
											<span>{place.name}</span>
											<span class="text-xs text-neutral-400 font-normal"
												>{place.productName || ''}</span
											>
										</div>
									</td>
									<td
										class="px-6 py-3 text-neutral-600 max-w-[200px] truncate"
										title={place.address}
									>
										{place.address}
									</td>
									<td class="px-6 py-3 text-neutral-600">{place.regency || '-'}</td>
									<td class="px-6 py-3">
										<span
											class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200"
										>
											{place.productCategory}
										</span>
									</td>
									<td class="px-6 py-3 font-mono text-neutral-600">
										{place.productPriceInRupiah ? formatRupiah(place.productPriceInRupiah) : '-'}
									</td>
									<td class="px-6 py-3 text-neutral-600">
										{place.capacity ? `${place.capacity} ${place.capacityUnit}` : '-'}
									</td>
									<td class="px-6 py-3 text-neutral-600">{place.phoneNumber || '-'}</td>
									<td class="px-6 py-3 text-neutral-600">
										{#if place.website}
											<a
												href={place.website.startsWith('http')
													? place.website
													: `https://${place.website}`}
												target="_blank"
												class="text-blue-600 hover:underline">Link</a
											>
										{:else}
											-
										{/if}
									</td>
									<td class="px-6 py-3 text-neutral-600">{place.email || '-'}</td>
									<td class="px-6 py-3 text-right">
										<button
											aria-label="Remove place"
											onclick={() => removePlace(place.id)}
											class="text-neutral-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
											title="Remove"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-5 h-5"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
												/></svg
											>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</main>
</div>
