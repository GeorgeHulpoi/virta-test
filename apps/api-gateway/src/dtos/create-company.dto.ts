import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

import type {CreateCompany} from '../../../company-microservice/src/types';

export class CreateCompanyDTO implements CreateCompany {
	@ApiProperty({
		description: 'The name of the company.',
		minimum: 1,
		maximum: 128,
	})
	name: string;

	@ApiPropertyOptional({
		description: 'The parent company ObjectId as hex string.',
	})
	parent?: string;
}
