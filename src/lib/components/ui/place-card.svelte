<script lang="ts">
	import type { Place } from '$lib/types/maps.type';

	// Define the component's props
	export let place: Place;

	// Helper function to format Rupiah
	const formatRupiah = (amount: number): string => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	};

	// Helper function for social link icons
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
</script>

<div class="max-w-4xl mx-auto my-8 bg-white shadow-xl rounded-xl overflow-hidden">
	<div class="md:flex">
		<div class="md:shrink-0">
			<img
				class="h-48 w-full object-cover md:w-48"
				src={place.productPictureUrl}
				alt={place.productName}
			/>
		</div>
		<div class="p-8">
			<h1 class="text-3xl font-extrabold text-gray-900 mb-2">{place.name}</h1>
			<p class="text-lg text-indigo-600 mb-4">{place.regency}, {place.province}</p>
			<p class="mt-2 text-gray-600">{place.description}</p>
		</div>
	</div>

	<div class="p-8 pt-4">
		<h2 class="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
			Product: {place.productName}
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			<div>
				<p class="text-sm font-medium text-gray-500">Price</p>
				<p class="text-xl font-bold text-green-600">{formatRupiah(place.productPriceInRupiah)}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500">Category</p>
				<p class="text-lg text-gray-800">{place.productCategory}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500">Capacity/Unit</p>
				<p class="text-lg text-gray-800">{place.capacity} {place.capacityUnit}</p>
			</div>
		</div>
		<div class="mb-6">
			<p class="text-sm font-medium text-gray-500">Product Description</p>
			<p class="text-base text-gray-700 italic">{place.productDescription}</p>
		</div>

		<h2 class="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">Contact & Legality</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="space-y-3">
				<p class="text-gray-700">**Address:** {place.address}</p>
				<p class="text-gray-700">
					**Legality:** <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded"
						>{place.legality}</span
					>
				</p>
			</div>
			<div class="space-y-2">
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
						href={place.website}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center text-blue-600 hover:text-blue-800 transition duration-150"
					>
						{getSocialIcon('website')} <span class="ml-2">Website</span>
					</a>
				{/if}
				{#if place.instagram}
					<a
						href={place.instagram}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center text-pink-600 hover:text-pink-800 transition duration-150"
					>
						{getSocialIcon('instagram')} <span class="ml-2">Instagram</span>
					</a>
				{/if}
				{#if place.facebook}
					<a
						href={place.facebook}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
					>
						{getSocialIcon('facebook')} <span class="ml-2">Facebook</span>
					</a>
				{/if}
				{#if place.email}
					<a
						href={`mailto:${place.email}`}
						class="flex items-center text-gray-600 hover:text-gray-800 transition duration-150"
					>
						{getSocialIcon('email')} <span class="ml-2">Email</span>
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
