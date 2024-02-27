import {PickType} from '@nestjs/mapped-types';

import {FindCompanyByIdDTO} from './find-company-by-id.dto';
import {DeleteCompany} from '../../types';

export class DeleteCompanyDTO
	extends PickType(FindCompanyByIdDTO, ['id'] as const)
	implements DeleteCompany {}
