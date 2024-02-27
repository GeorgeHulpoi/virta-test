import type {Observable} from 'rxjs';

export interface StationService {
	Near(payload: NearStations): Observable<NearStationsResult>;
	Find(payload: object): Observable<StationList>;
	FindById(payload: FindStationById): Observable<Station>;
	Create(payload: CreateStation): Observable<Station>;
	Update(payload: UpdateStation): Observable<Station>;
	Delete(payload: FindStationById): Observable<object>;
}

export interface Station {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	company: string;
	address: string;
}

export type CreateStation = Omit<Station, 'id'>;

export type UpdateStation = Pick<Station, 'id'> & Partial<Omit<Station, 'id'>>;

export type FindStationById = Pick<Station, 'id'>;

export interface NearStations {
	latitude: number;
	longitude: number;
	radius: number;
	company?: string;
}

export interface NearStationsResultItem {
	latitude: number;
	longitude: number;
	distance: number;
	items: Omit<Station, 'latitude' | 'longitude'>[];
}

export interface NearStationsResult {
	data: NearStationsResultItem[];
}

export interface StationList {
	data: Station[];
}
