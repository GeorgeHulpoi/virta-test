import { IsDefined, IsMongoId } from 'class-validator';

export class FindCompanyByIdDTO {
	@IsDefined()
	@IsMongoId()
	id: string;
}
