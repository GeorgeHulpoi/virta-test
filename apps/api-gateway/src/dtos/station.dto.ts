import {ApiProperty} from '@nestjs/swagger';

import type {Station} from '../../../station-microservice/src/types';

export class StationDTO implements Station {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	latitude: number;

	@ApiProperty()
	longitude: number;

	@ApiProperty()
	company: string;

	@ApiProperty()
	address: string;
}
