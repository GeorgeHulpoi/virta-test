import type {Observable} from 'rxjs';

export interface CompanyService {
	Find(payload: object): Observable<CompanyList>;
	FindById(payload: FindCompanyById): Observable<Company>;
	Create(payload: CreateCompany): Observable<Company>;
	Update(payload: UpdateCompany): Observable<Company>;
	Delete(payload: FindCompanyById): Observable<object>;
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

export interface CompanyList {
	data: Company[];
}
