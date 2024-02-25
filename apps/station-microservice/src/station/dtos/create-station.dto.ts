import {
	IsDefined,
	IsLatitude,
	IsLongitude,
	IsMongoId,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import {IsCompany} from '../validators/company.validator';

export class CreateStationDTO {
	@MaxLength(128)
	@MinLength(1)
	@IsString()
	@IsDefined()
	name: string;

	@IsLatitude()
	@IsDefined()
	latitude: number;

	@IsLongitude()
	@IsDefined()
	longitude: number;

	@IsCompany()
	@IsMongoId()
	company: string;

	@MaxLength(256)
	@MinLength(1)
	@IsString()
	@IsDefined()
	address: string;
}
