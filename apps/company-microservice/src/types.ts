import type {Observable} from 'rxjs';

export interface CompanyService {
	create(payload: CreateCompany): Observable<Company>;
	update(payload: UpdateCompany): Observable<Company>;
	delete(payload: FindCompanyById): Observable<Company>;
}

export interface Company {
	id: string;
	name: string;
	parent?: string;
}

export type CreateCompany = Omit<Company, 'id'>;
export type FindCompanyById = Pick<Company, 'id'>;
export type UpdateCompany = FindCompanyById & Partial<CreateCompany>;
