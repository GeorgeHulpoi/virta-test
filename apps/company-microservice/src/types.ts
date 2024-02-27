import type {Observable} from 'rxjs';

export interface CompanyService {
	findById(payload: FindCompanyById): Observable<Company>;
	create(payload: CreateCompany): Observable<Company>;
	update(payload: UpdateCompany): Observable<Company>;
	delete(payload: FindCompanyById): Observable<object>;
}

export interface Company {
	id: string;
	name: string;
	parent?: string;
	children?: Company[];
}

export type CreateCompany = Omit<Company, 'id'>;
export type FindCompanyById = Pick<Company, 'id'> & {includeChildren?: boolean};
export type UpdateCompany = FindCompanyById & Partial<CreateCompany>;
export type DeleteCompany = Pick<Company, 'id'>;
