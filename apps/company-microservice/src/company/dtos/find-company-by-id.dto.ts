import {IsDefined} from 'class-validator';

import {IsObjectId} from '../validators/objectid.validator';

export class FindCompanyByIdDTO {
	@IsDefined()
	@IsObjectId()
	id: string;
}
