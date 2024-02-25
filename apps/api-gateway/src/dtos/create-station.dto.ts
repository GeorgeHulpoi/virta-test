import {ApiProperty} from '@nestjs/swagger';

import type {CreateStation} from '../../../station-microservice/src/types';

export class CreateStationDTO implements CreateStation {
	@ApiProperty({
		description: 'The name of the company.',
		minimum: 1,
		maximum: 128,
	})
	name: string;

	@ApiProperty({
		description: 'The latitude coordinate.',
		minimum: -90,
		maximum: 90,
	})
	latitude: number;

	@ApiProperty({
		description: 'The longitude coordinate.',
		minimum: -180,
		maximum: 180,
	})
	longitude: number;

	@ApiProperty({
		description: 'The company ObjectId as hex string.',
	})
	company: string;

	@ApiProperty({
		description: 'The address',
		minimum: 1,
		maximum: 256,
	})
	address: string;
}
