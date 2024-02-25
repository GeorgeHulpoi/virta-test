import {Controller, UseFilters} from '@nestjs/common';
import {GrpcMethod} from '@nestjs/microservices';
import {Observable} from 'rxjs';

import {ExceptionFilter} from '../../../../src/shared/filters/rpc-exception.filter';
import {StationService} from './station.service';
import {StationPOJO} from './station.schema';
import {CreateStationDTO} from './dtos/create-station.dto';

@UseFilters(ExceptionFilter)
@Controller()
export class StationController {
	constructor(private readonly stationService: StationService) {}

	@GrpcMethod('StationService', 'Create')
	create(createCompanyDto: CreateStationDTO): Observable<StationPOJO> {
		return this.stationService.create(createCompanyDto);
	}
}
