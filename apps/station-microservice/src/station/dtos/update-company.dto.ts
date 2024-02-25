import {IntersectionType, PartialType} from '@nestjs/mapped-types';

import {CreateStationDTO} from './create-station.dto';
import {FindStationByIdDTO} from './find-station-by-id.dto';

export class UpdateStationByIdDTO extends IntersectionType(
	PartialType(CreateStationDTO),
	FindStationByIdDTO,
) {}
