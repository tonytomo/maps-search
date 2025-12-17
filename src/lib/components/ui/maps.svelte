<script lang="ts">
	import { onMount } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { Coordinate, Place } from '$lib/types/maps.type';

	export let apiKey: string;
	export let mapId: string;

	let mapElement: HTMLDivElement;
	let mapInstance: google.maps.Map | undefined;
	let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;
	let mapMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

	export let neCorner: Coordinate;
	export let swCorner: Coordinate;
	export let places: Place[];

	const DEFAULT_CENTER = { lat: -7.549, lng: 110.735 };
	const DEFAULT_ZOOM = 12;

	$: {
		// TODO: Make better pinpoint using HTML
		if (AdvancedMarkerElement && mapInstance) {
			for (const marker of mapMarkers) marker.map = null;
			for (const place of places) {
				const newMarker = new AdvancedMarkerElement({
					map: mapInstance,
					position: {
						lat: place.location.latitude,
						lng: place.location.longitude
					},
					title: place.name,
					gmpClickable: true
				});
				mapMarkers.push(newMarker);
			}
		}
	}

	onMount(async () => {
		try {
			setOptions({ key: apiKey });

			const { AdvancedMarkerElement: element } = await importLibrary('marker');
			const { Map } = await importLibrary('maps');

			AdvancedMarkerElement = element;

			mapInstance = new Map(mapElement, {
				center: getLatestPos(),
				zoom: getLatestZoom(),
				mapId: mapId,
				scaleControl: true,
				mapTypeControl: false,
				fullscreenControl: false,
				streetViewControl: false
			});

			if (mapInstance) {
				mapInstance.addListener('bounds_changed', () => {
					if (!mapInstance) return;
					const bounds = mapInstance.getBounds();
					if (bounds) {
						neCorner = {
							latitude: bounds.getNorthEast().lat(),
							longitude: bounds.getNorthEast().lng()
						};
						swCorner = {
							latitude: bounds.getSouthWest().lat(),
							longitude: bounds.getSouthWest().lng()
						};

						setLatestPos(bounds.getCenter());
					}

					const zoom = mapInstance.getZoom();
					if (zoom) setLatestZoom(zoom);
				});
			}
		} catch (e) {
			console.error('Error loading Google Maps:', e);
		}
	});

	function getLatestPos() {
		const posJson = localStorage.getItem('pos');
		if (posJson) return JSON.parse(posJson) as google.maps.LatLng;
		return DEFAULT_CENTER;
	}

	function setLatestPos(pos: google.maps.LatLng) {
		localStorage.setItem('pos', JSON.stringify(pos));
	}

	function getLatestZoom() {
		const zoomJson = localStorage.getItem('zoom');
		if (zoomJson) return JSON.parse(zoomJson) as number;
		return DEFAULT_ZOOM as number;
	}

	function setLatestZoom(zoom: number) {
		localStorage.setItem('zoom', JSON.stringify(zoom));
	}
</script>

<div bind:this={mapElement} class="w-full h-screen"></div>
