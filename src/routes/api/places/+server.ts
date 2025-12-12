// import { MAPS_API_KEY, MAPS_API_URL } from '$env/static/private';
// import type { MapsResponse, Place } from '$lib/types/maps.type.js';
// import { error, json } from '@sveltejs/kit';

// export async function POST({ request }) {
// 	const data = await request.formData();
// 	const latitude = Number(data.get('latitude') as string);
// 	const longitude = Number(data.get('longitude') as string);
// 	const radius = Number(data.get('radius') as string);
// 	const search = data.get('search') as string;

// 	if (!latitude || !longitude || !radius || !search) {
// 		let notFilled: string[] = [];

// 		if (!latitude) {
// 			notFilled.push('latitude');
// 		}
// 		if (!longitude) {
// 			notFilled.push('longitude');
// 		}
// 		if (!radius) {
// 			notFilled.push('radius');
// 		}
// 		if (!search) {
// 			notFilled.push('search');
// 		}

// 		console.error('Input not filled:', notFilled.join(', '));
// 		return error(400, `${notFilled.join(', ')} must be filled!`);
// 	}

// 	const url = MAPS_API_URL;
// 	const payload = {
// 		languageCode: 'id',
// 		textQuery: search,
// 		locationBias: {
// 			circle: {
// 				center: {
// 					latitude,
// 					longitude
// 				},
// 				radius
// 			}
// 		}
// 	};

// 	console.log(`Run POST ${url} with payload:`, JSON.stringify(payload, null, 2));

// 	try {
// 		const response = await fetch(url, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'X-Goog-Api-Key': MAPS_API_KEY,
// 				'X-Goog-FieldMask': '*'
// 			},
// 			body: JSON.stringify(payload)
// 		});

// 		if (!response.ok) {
// 			const errorMsg = await response.json();
// 			console.error(errorMsg);
// 			throw Error('Error when getting info:', errorMsg);
// 		}

// 		const data: MapsResponse = await response.json();

// 		const places: Place[] = data.places.map((place) => {
// 			return {
// 				id: place.id,
// 				name: place.displayName.text,
// 				description: '',
// 				address: place.shortFormattedAddress,
// 				regency:
// 					place.addressComponents.find((component) =>
// 						component.types?.includes('administrative_area_level_2')
// 					)?.shortText || '',
// 				province:
// 					place.addressComponents.find((component) =>
// 						component.types?.includes('administrative_area_level_1')
// 					)?.shortText || '',
// 				productName: '',
// 				productPictureUrl: '',
// 				productDescription: '',
// 				productCategory: '',
// 				productPriceInRupiah: 0,
// 				capacity: 0,
// 				capacityUnit: '',
// 				legality: '',
// 				phoneNumber: place.internationalPhoneNumber || place.nationalPhoneNumber || '',
// 				website: place.websiteUri || '',
// 				facebook: '',
// 				instagram: '',
// 				email: ''
// 			};
// 		});

// 		const nextPageToken = data.nextPageToken;

// 		return json({
// 			places,
// 			nextPageToken
// 		});
// 	} catch (e) {
// 		console.error('Error:', JSON.stringify(e, null, 2));
// 		error(400, 'Something went wrong!');
// 	}
// }
