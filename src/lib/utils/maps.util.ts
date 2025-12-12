import { PUBLIC_MAPS_API_KEY, PUBLIC_MAPS_API_URL } from '$env/static/public';
import type { MapsResponse, Place, PlaceAPIResponse } from '$lib/types/maps.type';

interface Props {
	latitude: number;
	longitude: number;
	radius: number;
	search: string;
}

export async function getPlacesInfo({
	latitude,
	longitude,
	radius,
	search
}: Props): Promise<PlaceAPIResponse | null> {
	if (!latitude || !longitude || !radius || !search) {
		let notFilled: string[] = [];

		if (!latitude) notFilled.push('Latitude');
		if (!longitude) notFilled.push('Longitude');
		if (!radius) notFilled.push('Radius');
		if (!search) notFilled.push('Search');

		console.error('Input not filled:', notFilled.join(', '));
		return null;
	}

	const payload = {
		languageCode: 'id',
		textQuery: search,
		locationBias: {
			circle: {
				center: {
					latitude,
					longitude
				},
				radius
			}
		}
	};

	const response = await fetch(PUBLIC_MAPS_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': PUBLIC_MAPS_API_KEY,
			'X-Goog-FieldMask': '*'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errorData = await response.json();
		console.error('Failed to fetch places:', errorData);
		return null;
	}

	const data: MapsResponse = await response.json();

	const places: Place[] = data.places.map((place) => {
		return {
			id: place.id,
			name: place.displayName.text,
			description: '',
			address: place.shortFormattedAddress,
			regency:
				place.addressComponents.find((component) =>
					component.types?.includes('administrative_area_level_2')
				)?.shortText || '',
			province:
				place.addressComponents.find((component) =>
					component.types?.includes('administrative_area_level_1')
				)?.shortText || '',
			productName: '',
			productPictureUrl: '',
			productDescription: '',
			productCategory: '',
			productPriceInRupiah: 0,
			capacity: 0,
			capacityUnit: '',
			legality: '',
			phoneNumber: place.internationalPhoneNumber || place.nationalPhoneNumber || '',
			website: place.websiteUri || '',
			facebook: '',
			instagram: '',
			email: ''
		};
	});

	return {
		places,
		nextPageToken: data.nextPageToken
	};
}
