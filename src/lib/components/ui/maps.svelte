<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

	export let apiKey: string;
	export let mapId: string;

	let mapElement: HTMLDivElement;
	let mapInstance: google.maps.Map | undefined;
	export let clickedLat: number | null = null;
	export let clickedLng: number | null = null;

	const DEFAULT_CENTER = { lat: -7.549, lng: 110.735 };
	const DEFAULT_ZOOM = 12;

	onMount(async () => {
		try {
			setOptions({
				key: apiKey
			});

			// 3. **FIX:** Use the global 'google.maps' namespace in the type assertion.
			// We assert that the MapsLibrary returned contains the Map class.
			const { Map } = await importLibrary('maps');

			// 'Map' is now correctly typed as google.maps.MapConstructor
			mapInstance = new Map(mapElement, {
				center: DEFAULT_CENTER,
				zoom: DEFAULT_ZOOM,
				mapId: mapId
			});

			if (mapInstance) {
				// Use the global type for the event object
				mapInstance.addListener('click', (mapsMouseEvent: google.maps.MapMouseEvent) => {
					const latLng = mapsMouseEvent.latLng;

					if (latLng) {
						const coords = latLng.toJSON();
						clickedLat = coords.lat;
						clickedLng = coords.lng;

						console.log(`Clicked Lat: ${clickedLat}, Lng: ${clickedLng}`);
					}
				});
			}
		} catch (e) {
			console.error('Error loading Google Maps:', e);
		}
	});
</script>

<div bind:this={mapElement} class="map-container"></div>

<style>
	.map-container {
		width: 100%;
		height: 500px;
		border: 1px solid #ccc;
	}
</style>
