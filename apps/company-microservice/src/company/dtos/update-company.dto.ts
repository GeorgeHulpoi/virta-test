import {IntersectionType, PartialType} from '@nestjs/mapped-types';

import {CreateCompanyDTO} from './create-company.dto';
import {FindCompanyByIdDTO} from './find-company-by-id.dto';

export class UpdateCompanyByIdDTO extends IntersectionType(
	PartialType(CreateCompanyDTO),
	FindCompanyByIdDTO,
) {}
