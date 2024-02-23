import {PartialType} from '@nestjs/swagger';

import type {UpdateCompany} from '../../../company-microservice/src/types';
import {CreateCompanyDTO} from './create-company.dto';

export class UpdateCompanyDTO
	extends PartialType(CreateCompanyDTO)
	implements Omit<UpdateCompany, 'id'> {}
