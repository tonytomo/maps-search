<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Place } from '$lib/types/maps.type';
	import { onMount } from 'svelte';

	let places: Place[] = $state([]);

	onMount(() => {
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) places = JSON.parse(placesJson);
	});

	function removePlace(id: string) {
		let placeList: Place[] = [];
		const placesJson = localStorage.getItem('savedPlaces');
		if (placesJson) placeList = JSON.parse(placesJson) as Place[];

		const filteredPlaces = placeList.filter((item) => item.id !== id);
		localStorage.setItem('savedPlaces', JSON.stringify(filteredPlaces));

		places = filteredPlaces;
	}

	function removeAllPlaces() {
		localStorage.setItem('savedPlaces', JSON.stringify([]));
		places = [];
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex justify-between gap-2">
		<div class="flex gap-2">
			<a href={resolve('/')} class="inline-block p-2 bg-neutral-400"> Back </a>
		</div>

		<div class="flex gap-2">
			<button onclick={removeAllPlaces} class="cursor-pointer p-2 bg-red-500 text-white">
				Reset
			</button>
			<button onclick={() => window.print()} class="cursor-pointer p-2 bg-orange-400">
				Print
			</button>
		</div>
	</div>

	<div class="overflow-x-auto">
		<table
			class="table-auto md:table-fixed [&_th,&_td]:p-2 [&_th,&_td]:border [&_th]:w-max [&_th]:text-left [&_td]:font-normal"
		>
			<caption>Table of Places</caption>
			<thead>
				<tr>
					<th>Nama Supplier/Produsen</th>
					<th>Tentang Supplier</th>
					<th>Alamat </th>
					<th>Kabupaten</th>
					<th>Provinsi</th>
					<th>Nama Produk</th>
					<th>Deskripsi Produk</th>
					<th>Kategori Produk</th>
					<th>Harga Produk</th>
					<th>Kapasitas Produksi </th>
					<th>Legalitas</th>
					<th>Foto Produk ( Link Google Drive)</th>
					<th>Kontak Supplier</th>
					<th>Website/Marketplace</th>
					<th>Facebook</th>
					<th>Instagram</th>
					<th>E-mail</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{#each places as place, i (place.id)}
					<tr>
						<td>{place.name}</td>
						<td>{place.description}</td>
						<td>{place.address}</td>
						<td>{place.regency}</td>
						<td>{place.province}</td>
						<td>{place.productName}</td>
						<td>{place.productDescription}</td>
						<td>{place.productCategory}</td>
						<td>{place.productPriceInRupiah}</td>
						<td>{place.capacity} {place.capacityUnit}</td>
						<td>{place.legality}</td>
						<td>{place.productPictureUrl}</td>
						<td>{place.phoneNumber}</td>
						<td>{place.website}</td>
						<td>{place.facebook}</td>
						<td>{place.instagram}</td>
						<td>{place.email}</td>
						<td>
							<button
								aria-label="remove place"
								onclick={() => removePlace(place.id)}
								class="cursor-pointer p-4 bg-red-500 text-white"
							>
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
