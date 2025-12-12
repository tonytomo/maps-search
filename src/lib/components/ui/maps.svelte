<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

	export let apiKey: string;
	export let mapId: string;

	let mapElement: HTMLDivElement;
	let mapInstance: google.maps.Map | undefined;
	let mapMarker: google.maps.marker.AdvancedMarkerElement | undefined;

	export let clickedLat: number;
	export let clickedLng: number;
	export let isMarked: boolean;

	const DEFAULT_CENTER = { lat: clickedLat, lng: clickedLng };
	const DEFAULT_ZOOM = 12;

	onMount(async () => {
		try {
			setOptions({ key: apiKey });

			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement } = await importLibrary('marker');

			mapInstance = new Map(mapElement, {
				center: DEFAULT_CENTER,
				zoom: DEFAULT_ZOOM,
				mapId: mapId
			});

			if (mapInstance) {
				mapInstance.addListener('click', (mapsMouseEvent: google.maps.MapMouseEvent) => {
					const latLng = mapsMouseEvent.latLng;

					if (latLng) {
						const coords = latLng.toJSON();
						clickedLat = coords.lat;
						clickedLng = coords.lng;

						if (mapMarker) mapMarker.map = null;

						mapMarker = new AdvancedMarkerElement({
							map: mapInstance,
							position: coords,
							title: 'Center Point'
						});

						isMarked = true;
					}
				});
			}
		} catch (e) {
			console.error('Error loading Google Maps:', e);
		}
	});
</script>

<div bind:this={mapElement} class="w-full h-screen"></div>
