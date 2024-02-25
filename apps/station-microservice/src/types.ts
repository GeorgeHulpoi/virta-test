import type {Observable} from 'rxjs';

export interface StationService {
	Create(payload: CreateStation): Observable<Station>;
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
