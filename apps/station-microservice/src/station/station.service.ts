import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Observable, from, switchMap, throwError} from 'rxjs';

import {RpcBadRequestException} from '../../../../src/shared/exceptions/bad-request.exception';
import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';
import {RpcNotFoundException} from '../../../../src/shared/exceptions/not-found.exception';
import {CreateStationDTO} from './dtos/create-station.dto';
import {UpdateStationByIdDTO} from './dtos/update-company.dto';
import {Station, StationDocument, StationPOJO} from './station.schema';
import {FindStationByIdDTO} from './dtos/find-station-by-id.dto';

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

	update(
		updateStationByIdDTO: UpdateStationByIdDTO,
	): Observable<StationPOJO> {
		const {id, ...restOfDTO} = updateStationByIdDTO;

		if (Object.keys(restOfDTO).length === 0) {
			throw new RpcBadRequestException();
		}

		return from(this.model.findById(id).exec()).pipe(
			switchMap((doc) => {
				if (!doc) {
					return throwError(() => new RpcNotFoundException());
				}

				for (const key in restOfDTO) {
					doc[key] = restOfDTO[key];

					if (key === 'latitude' || key === 'longitude') {
						doc.markModified('location');
					}
				}

				return from(doc.save());
			}),
		);
	}

	delete(FindStationByIdDTO: FindStationByIdDTO): Observable<object> {
		const {id} = FindStationByIdDTO;

		return from(
			this.model
				.findByIdAndDelete(id)
				.exec()
				.catch(this.catchError.bind(this))
				.then((doc) => {
					if (!doc) throw new RpcNotFoundException();
					return {};
				}),
		);
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
