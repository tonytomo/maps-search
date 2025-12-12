export interface RawPlace {
	id: string;
	displayName: {
		text: string;
	};
	primaryTypeDisplayName: {
		text: string;
		languageCode: string;
	};
	googleMapsUri: string;
	websiteUri: string;
	businessStatus: string;
	shortFormattedAddress: string;
	formattedAddress: string;
	addressComponents: {
		longText: string;
		shortText: string;
		types: string[];
	}[];
	internationalPhoneNumber: string;
	nationalPhoneNumber: string;
}

export interface MapsResponse {
	places: RawPlace[];
	nextPageToken: string;
	searchUri: string;
}

export interface PlaceAPIResponse {
	places: Place[];
	nextPageToken: string;
}

export interface Place {
	id: string;
	name: string;
	description: string;
	address: string;
	regency: string;
	province: string;
	productName: string;
	productPictureUrl: string;
	productDescription: string;
	productCategory: string;
	productPriceInRupiah: number;
	capacity: number;
	capacityUnit: string;
	legality: string;
	phoneNumber: string;
	website: string;
	facebook: string;
	instagram: string;
	email: string;
}
