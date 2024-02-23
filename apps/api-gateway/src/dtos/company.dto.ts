import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

import type {Company} from '../../../company-microservice/src/types';

export class CompanyDTO implements Company {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiPropertyOptional()
	parent?: string;
}
