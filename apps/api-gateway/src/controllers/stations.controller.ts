import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Inject,
	Param,
	Patch,
	Post,
	Get,
	Query,
} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {ApiResponse} from '@nestjs/swagger';
import {Observable, catchError, map} from 'rxjs';

import type {StationService} from '../../../station-microservice/src/types';
import {catchRpcException} from '../catchRpcException';
import {CreateStationDTO} from '../dtos/create-station.dto';
import {StationDTO} from '../dtos/station.dto';
import {UpdateStationDTO} from '../dtos/update-station.dto';
import {
	NearStationsDTO,
	NearStationsResultDTO,
} from '../dtos/near-stations.dto';

@Controller('api/stations')
export class StationsController {
	private stationService: StationService;

	constructor(@Inject('STATION_PACKAGE') private client: ClientGrpc) {}

	onModuleInit() {
		this.stationService =
			this.client.getService<StationService>('StationService');
	}

	@Get('near')
	@ApiResponse({
		status: 200,
		type: [NearStationsResultDTO],
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	near(@Query() query: NearStationsDTO): Observable<NearStationsResultDTO[]> {
		return this.stationService.Near(query).pipe(
			map((result) => result.data),
			catchError(catchRpcException),
		);
	}

	@Get()
	@ApiResponse({
		status: 200,
		type: [StationDTO],
	})
	@ApiResponse({status: 500, description: 'Internal Server Error.'})
	find(): Observable<StationDTO[]> {
		return this.stationService.Find({}).pipe(
			map((result) => result.data),
			catchError(catchRpcException),
		);
	}

	@Get(':id')
	@HttpCode(200)
	@ApiResponse({
		status: 200,
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
	findById(@Param('id') id: string): Observable<StationDTO> {
		return this.stationService
			.FindById({id})
			.pipe(catchError(catchRpcException));
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
