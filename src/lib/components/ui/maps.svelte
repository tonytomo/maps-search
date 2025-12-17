<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
	import type { Coordinate, Place } from '$lib/types/maps.type';

	export let apiKey: string;
	export let mapId: string;

	let mapElement: HTMLDivElement;
	let mapInstance: google.maps.Map | undefined;
	let infoWindow: google.maps.InfoWindow | undefined;
	let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;
	let PinElement: typeof google.maps.marker.PinElement | undefined;
	let mapMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

	export let neCorner: Coordinate;
	export let swCorner: Coordinate;
	export let places: Place[];

	const DEFAULT_CENTER = { lat: -7.549, lng: 110.735 };
	const DEFAULT_ZOOM = 12;

	$: {
		updateMarkers(places);
	}

	function updateMarkers(newPlaces: Place[]) {
		if (!AdvancedMarkerElement || !mapInstance || !infoWindow) return;

		// Clear existing markers
		for (const marker of mapMarkers) marker.map = null;
		mapMarkers = [];

		for (const place of newPlaces) {
			const content = createCustomMarker(place);

			const marker = new AdvancedMarkerElement({
				map: mapInstance,
				position: {
					lat: place.location.latitude,
					lng: place.location.longitude
				},
				title: place.name,
				content: content,
				gmpClickable: true
			});

			// Add click listener to the MARKER instance
			marker.addListener('click', () => {
				openInfoWindow(place, marker);
			});

			mapMarkers.push(marker);
		}
	}

	function createCustomMarker(place: Place) {
		const container = document.createElement('div');
		container.className = 'custom-map-marker group relative cursor-pointer';

		// Inner pulse effect
		const pulse = document.createElement('div');
		pulse.className =
			'absolute -inset-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-30 group-hover:animate-ping transition-opacity duration-300';

		// Main marker body
		const body = document.createElement('div');
		body.className = `
			relative flex items-center justify-center 
			w-10 h-10 rounded-full 
			bg-white shadow-md border-2 border-white 
			transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
			group-hover:scale-110 group-hover:-translate-y-1
			overflow-hidden
		`;

		// Icon logic based on category or just specific image
		if (place.productPictureUrl) {
			const img = document.createElement('img');
			img.src = place.productPictureUrl;
			img.className = 'w-full h-full object-cover';
			body.appendChild(img);
		} else {
			body.innerHTML = `<span class="text-xl">📍</span>`;
		}

		// Tooltip (Name) on hover
		const tooltip = document.createElement('div');
		tooltip.className = `
			absolute bottom-full left-1/2 -translate-x-1/2 mb-2
			px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg
			opacity-0 translate-y-2 pointer-events-none
			group-hover:opacity-100 group-hover:translate-y-0
			transition-all duration-200 bg-opacity-90 whitespace-nowrap z-10
		`;
		tooltip.innerText = place.name;

		container.appendChild(pulse);
		container.appendChild(body);
		container.appendChild(tooltip);

		return container;
	}

	function openInfoWindow(place: Place, marker: google.maps.marker.AdvancedMarkerElement) {
		if (!mapInstance || !infoWindow) return;

		const content = document.createElement('div');
		content.className = 'w-[280px] p-0 flex flex-col font-sans';

		content.innerHTML = `
			<div class="relative w-full h-32 bg-neutral-100 rounded-t-lg overflow-hidden">
				${
					place.productPictureUrl
						? `<img src="${place.productPictureUrl}" alt="${place.name}" class="w-full h-full object-cover" />`
						: `<div class="w-full h-full flex items-center justify-center text-4xl bg-neutral-100">📍</div>`
				}
				<div class="absolute top-2 left-2">
					<span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-neutral-800 rounded shadow-sm">
						${place.productCategory}
					</span>
				</div>
			</div>
			<div class="p-3 flex flex-col gap-1">
				<h3 class="font-bold text-base text-neutral-900 leading-tight">${place.name}</h3>
				<p class="text-xs text-neutral-500 line-clamp-2">${place.address}</p>
				
				<div class="mt-2 flex gap-2">
					<a href="https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}" 
					   target="_blank" 
					   class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-md text-center transition-colors shadow-sm">
						Navigate
					</a>
				</div>
			</div>
		`;

		infoWindow.setContent(content);
		infoWindow.open(mapInstance, marker);
	}

	onMount(async () => {
		try {
			setOptions({ key: apiKey });

			const { AdvancedMarkerElement: element, PinElement: pin } = await importLibrary('marker');
			const { Map, InfoWindow } = await importLibrary('maps');

			AdvancedMarkerElement = element;
			PinElement = pin;

			mapInstance = new Map(mapElement, {
				center: getLatestPos(),
				zoom: getLatestZoom(),
				mapId: mapId,
				scaleControl: true,
				mapTypeControl: false,
				fullscreenControl: false,
				streetViewControl: false,
				clickableIcons: false // Disable default POI clicks to avoid confusion
			});

			infoWindow = new InfoWindow({
				minWidth: 280,
				headerDisabled: true // Should hide the header if supported by version, or we just style content
			});

			// Now we can initialize markers if places are already loaded
			updateMarkers(places);

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

				// Close infowindow when map is clicked
				mapInstance.addListener('click', () => {
					infoWindow?.close();
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

<div bind:this={mapElement} class="w-full h-full"></div>
