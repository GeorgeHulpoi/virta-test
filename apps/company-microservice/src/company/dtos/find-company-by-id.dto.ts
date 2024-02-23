import {IsDefined} from 'class-validator';

import {IsObjectId} from '../../../../../src/shared/validators/objectid.validator';

export class FindCompanyByIdDTO {
	@IsDefined()
	@IsObjectId()
	id: string;
}
