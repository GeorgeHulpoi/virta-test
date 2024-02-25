import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Observable, from} from 'rxjs';

import {Station, StationDocument, StationPOJO} from './station.schema';
import {CreateStationDTO} from './dtos/create-station.dto';
import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';

@Injectable()
export class StationService {
	private readonly logger = new Logger(StationService.name);

	constructor(
		@InjectModel(Station.name)
		private readonly model: Model<StationDocument>,
	) {}

	getModel(): Model<StationDocument> {
		return this.model;
	}

	create(createStationDTO: CreateStationDTO): Observable<StationPOJO> {
		const station = new this.model(createStationDTO);
		return from(station.save().catch(this.catchError.bind(this)));
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
