import {Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {
	Observable,
	catchError,
	from,
	map,
	of,
	switchMap,
	throwError,
} from 'rxjs';

import {RpcBadRequestException} from '../../../../src/shared/exceptions/bad-request.exception';
import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';
import {RpcNotFoundException} from '../../../../src/shared/exceptions/not-found.exception';
import type {CompanyService} from '../../../company-microservice/src/types';
import {CreateStationDTO} from './dtos/create-station.dto';
import {FindStationByIdDTO} from './dtos/find-station-by-id.dto';
import {NearStationsDTO} from './dtos/near-stations.dto';
import {UpdateStationByIdDTO} from './dtos/update-company.dto';
import {StationRepository} from './station.repository';
import {Station, StationDocument, StationPOJO} from './station.schema';

@Injectable()
export class StationService implements OnModuleInit {
	private readonly logger = new Logger(StationService.name);
	private companyService: CompanyService;

	constructor(
		@InjectModel(Station.name)
		private readonly model: Model<StationDocument>,
		@Inject('COMPANY_PACKAGE') private readonly client: ClientGrpc,
		private readonly repository: StationRepository,
	) {}

	onModuleInit(): void {
		this.companyService =
			this.client.getService<CompanyService>('CompanyService');
	}

	getModel(): Model<StationDocument> {
		return this.model;
	}

	near(nearStationsDTO: NearStationsDTO): Observable<any> {
		const {company, latitude, longitude, radius} = nearStationsDTO;

		const companies$: Observable<Types.ObjectId[] | undefined> = company
			? this.getCompanyAndChildrenIds(company).pipe(
					map((ids) =>
						ids.map((id) => Types.ObjectId.createFromHexString(id)),
					),
					catchError((err) => {
						if ('details' in err) {
							const details = JSON.parse(err.details);
							const {
								error: {statusCode},
							} = details;

							if (statusCode === 404) {
								return throwError(
									() => new RpcBadRequestException(),
								);
							}
						}

						this.logger.error(err);
						return throwError(() => new RpcInternalException());
					}),
				)
			: of(undefined);

		return companies$.pipe(
			switchMap((companies) =>
				from(
					this.repository.getStationNear({
						latitude,
						longitude,
						radius,
						companies,
					}),
				),
			),
			map((result) => ({data: result})),
		);
	}

	create(createStationDTO: CreateStationDTO): Observable<StationPOJO> {
		return from(this.repository.create(createStationDTO));
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

	getCompanyAndChildrenIds(id: string): Observable<string[]> {
		return this.companyService
			.findById({id, includeChildren: true})
			.pipe(
				map((doc) => [
					doc.id,
					...doc.children.map((child) => child.id),
				]),
			);
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
