import {IsBoolean, IsDefined, IsMongoId, IsOptional} from 'class-validator';

export class FindCompanyByIdDTO {
	@IsMongoId()
	@IsDefined()
	id: string;

	@IsBoolean()
	@IsOptional()
	includeChildren?: boolean;
}
