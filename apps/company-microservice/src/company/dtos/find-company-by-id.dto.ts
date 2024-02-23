import {IsDefined, IsMongoId} from 'class-validator';

export class FindCompanyByIdDTO {
	@IsMongoId()
	@IsDefined()
	id: string;
}
