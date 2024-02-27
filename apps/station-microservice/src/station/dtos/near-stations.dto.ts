import {
	IsDefined,
	IsLatitude,
	IsLongitude,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsPositive,
} from 'class-validator';

export class NearStationsDTO {
	@IsLatitude()
	@IsDefined()
	latitude: number;

	@IsLongitude()
	@IsDefined()
	longitude: number;

	@IsPositive()
	@IsNumber()
	@IsDefined()
	radius: number;

	@IsMongoId()
	@IsOptional()
	company?: string;
}
