<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import { browser } from '$app/environment';

	export let apiKey: string;
	export let mapId: string;

	let mounted = false;
	let mapElement: HTMLDivElement;
	let mapInstance: google.maps.Map | undefined;
	let mapMarker: google.maps.marker.AdvancedMarkerElement | undefined;
	let mapRadius: google.maps.Circle | undefined;

	export let clickedLat: number;
	export let clickedLng: number;
	export let radius: number;
	export let isMarked: boolean;

	const DEFAULT_CENTER = { lat: clickedLat, lng: clickedLng };
	const DEFAULT_ZOOM = 12;

	$: {
		if (mounted && isMarked) {
			if (mapRadius) mapRadius.setMap(null);
			mapRadius = new google.maps.Circle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: mapInstance,
				center: { lat: clickedLat, lng: clickedLng },
				radius
			});
		}
	}

	onMount(async () => {
		try {
			setOptions({ key: apiKey });

			const { Map } = await importLibrary('maps');
			const { AdvancedMarkerElement } = await importLibrary('marker');

			mapInstance = new Map(mapElement, {
				center: DEFAULT_CENTER,
				zoom: DEFAULT_ZOOM,
				mapId: mapId,
				scaleControl: true
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

						if (mapRadius) mapRadius.setMap(null);
						mapRadius = new google.maps.Circle({
							strokeColor: '#FF0000',
							strokeOpacity: 0.8,
							strokeWeight: 2,
							fillColor: '#FF0000',
							fillOpacity: 0.35,
							map: mapInstance,
							center: { lat: clickedLat, lng: clickedLng },
							radius
						});

						isMarked = true;
					}
				});
			}
		} catch (e) {
			console.error('Error loading Google Maps:', e);
		} finally {
			mounted = true;
		}
	});
</script>

<div bind:this={mapElement} class="w-full h-screen"></div>
