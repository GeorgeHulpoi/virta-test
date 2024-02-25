import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Inject,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {ApiResponse} from '@nestjs/swagger';
import {Observable, catchError} from 'rxjs';

import type {StationService} from '../../../station-microservice/src/types';
import {catchRpcException} from '../catchRpcException';
import {CreateStationDTO} from '../dtos/create-station.dto';
import {StationDTO} from '../dtos/station.dto';
import {UpdateStationDTO} from '../dtos/update-station.dto';

@Controller('api/stations')
export class StationsController {
	private stationService: StationService;

	constructor(@Inject('STATION_PACKAGE') private client: ClientGrpc) {}

	onModuleInit() {
		this.stationService =
			this.client.getService<StationService>('StationService');
	}

	@Post()
	@HttpCode(201)
	@ApiResponse({
		status: 201,
		description: 'The station has been successfully created.',
		type: StationDTO,
	})
	@ApiResponse({
		status: 400,
		description: "The given payload doesn't match the schema.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	create(@Body() createStationDTO: CreateStationDTO): Observable<StationDTO> {
		return this.stationService
			.Create(createStationDTO)
			.pipe(catchError(catchRpcException));
	}

	@Patch(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		description: 'The station has been successfully updated.',
		type: StationDTO,
	})
	@ApiResponse({
		status: 400,
		description: "The given payload doesn't match the schema.",
	})
	@ApiResponse({
		status: 404,
		description: "The resource doesn't exists.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	update(
		@Param('id') id: string,
		@Body() updateStationDTO: UpdateStationDTO,
	): Observable<StationDTO> {
		return this.stationService
			.Update({id, ...updateStationDTO})
			.pipe(catchError(catchRpcException));
	}

	@Delete(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
		description: 'The station has been successfully deleted.',
	})
	@ApiResponse({
		status: 404,
		description: "The resource doesn't exists.",
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	delete(@Param('id') id: string): Observable<object> {
		return this.stationService
			.Delete({id})
			.pipe(catchError(catchRpcException));
	}
}
