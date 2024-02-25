import {IsDefined, IsMongoId} from 'class-validator';

export class FindStationByIdDTO {
	@IsMongoId()
	@IsDefined()
	id: string;
}
