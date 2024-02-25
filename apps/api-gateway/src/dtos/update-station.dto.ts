import {PartialType} from '@nestjs/swagger';

import type {UpdateCompany} from '../../../company-microservice/src/types';
import {CreateStationDTO} from './create-station.dto';

export class UpdateStationDTO
	extends PartialType(CreateStationDTO)
	implements Omit<UpdateCompany, 'id'> {}
