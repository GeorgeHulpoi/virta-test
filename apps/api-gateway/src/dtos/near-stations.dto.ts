import {ApiProperty, ApiPropertyOptional, OmitType} from '@nestjs/swagger';

import {StationDTO} from './station.dto';

export class NearStationsDTO {
	@ApiProperty({
		minimum: -90,
		maximum: 90,
	})
	latitude: number;

	@ApiProperty({
		minimum: -180,
		maximum: 180,
	})
	longitude: number;

	@ApiProperty({
		description: 'The distance from the given coordinates in km.',
		minimum: 0,
	})
	radius: number;

	@ApiPropertyOptional({
		description:
			'You can get stations for a given company id (MongoDB ObjectId)',
	})
	company?: string;
}

export class NearStationsResultDTO {
	@ApiProperty()
	latitude: number;

	@ApiProperty()
	longitude: number;

	@ApiProperty()
	distance: number;

	@ApiProperty({
		description: 'The stations grouped under the same location',
		type: [OmitType(StationDTO, ['latitude', 'longitude'] as const)],
	})
	items: Omit<StationDTO, 'latitude' | 'longitude'>[];
}
