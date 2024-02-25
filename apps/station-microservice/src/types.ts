import type {Observable} from 'rxjs';

export interface StationService {
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
