import {Controller, UseFilters} from '@nestjs/common';
import {GrpcMethod} from '@nestjs/microservices';
import {Observable} from 'rxjs';

import {ExceptionFilter} from '../../../../src/shared/filters/rpc-exception.filter';
import {CreateStationDTO} from './dtos/create-station.dto';
import {FindStationByIdDTO} from './dtos/find-station-by-id.dto';
import {NearStationsDTO} from './dtos/near-stations.dto';
import {UpdateStationByIdDTO} from './dtos/update-company.dto';
import type {GetStationsNearResult} from './station.repository';
import {StationPOJO} from './station.schema';
import {StationService} from './station.service';

@UseFilters(ExceptionFilter)
@Controller()
export class StationController {
	constructor(private readonly stationService: StationService) {}

	@GrpcMethod('StationService', 'Near')
	near(nearStationsDTO: NearStationsDTO): Observable<GetStationsNearResult> {
		return this.stationService.near(nearStationsDTO);
	}

	@GrpcMethod('StationService', 'Create')
	create(createCompanyDto: CreateStationDTO): Observable<StationPOJO> {
		return this.stationService.create(createCompanyDto);
	}

	@GrpcMethod('StationService', 'Update')
	update(
		updateStationByIdDTO: UpdateStationByIdDTO,
	): Observable<StationPOJO> {
		return this.stationService.update(updateStationByIdDTO);
	}

	@GrpcMethod('StationService', 'Delete')
	delete(findCompanyByIdDTO: FindStationByIdDTO): Observable<object> {
		return this.stationService.delete(findCompanyByIdDTO);
	}
}
