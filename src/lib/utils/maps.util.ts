import { PUBLIC_MAPS_API_KEY, PUBLIC_MAPS_API_URL } from '$env/static/public';
import type { Coordinate, MapsResponse, Place, PlaceAPIResponse } from '$lib/types/maps.type';

interface Props {
	neCorner: Coordinate;
	swCorner: Coordinate;
	search: string;
}

export async function getPlacesInfo({
	neCorner,
	swCorner,
	search
}: Props): Promise<PlaceAPIResponse | null> {
	if (!neCorner || !swCorner || !search) {
		const notFilled: string[] = [];

		if (!neCorner || !swCorner) notFilled.push('Corners');
		if (!search) notFilled.push('Search');

		console.error('Input not filled:', notFilled.join(', '));
		return null;
	}

	const payload = {
		languageCode: 'id',
		textQuery: search,
		locationRestriction: {
			rectangle: {
				low: {
					latitude: swCorner.latitude,
					longitude: swCorner.longitude
				},
				high: {
					latitude: neCorner.latitude,
					longitude: neCorner.longitude
				}
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
			tags: place.types,
			address: place.shortFormattedAddress,
			regency:
				place.addressComponents.find((component) =>
					component.types?.includes('administrative_area_level_2')
				)?.shortText || '',
			province:
				place.addressComponents.find((component) =>
					component.types?.includes('administrative_area_level_1')
				)?.shortText || '',
			location: place.location,
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

	const result = {
		places,
		nextPageToken: data.nextPageToken
	};

	localStorage.setItem('curr', JSON.stringify(result));

	return result;
}

export function getProvinces(places: Place[]) {
	const provinces: string[] = [];

	places.map((place) => {
		if (!provinces.includes(place.province)) provinces.push(place.province);
	});

	console.log(provinces);

	return provinces;
}
