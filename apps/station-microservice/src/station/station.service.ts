import {Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {Types} from 'mongoose';
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
import {StationPOJO} from './station.schema';

@Injectable()
export class StationService implements OnModuleInit {
	private readonly logger = new Logger(StationService.name);
	private companyService: CompanyService;

	constructor(
		@Inject('COMPANY_PACKAGE') private readonly client: ClientGrpc,
		private readonly repository: StationRepository,
	) {}

	onModuleInit(): void {
		this.companyService =
			this.client.getService<CompanyService>('CompanyService');
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

	find(): Observable<{data: StationPOJO[]}> {
		return from(
			this.repository.find().then((docs) => ({
				data: docs,
			})),
		);
	}

	findById(findCompanyByIdDTO: FindStationByIdDTO): Observable<StationPOJO> {
		const {id} = findCompanyByIdDTO;
		return from(
			this.repository.findById(id).then((doc) => {
				if (!doc) throw new RpcNotFoundException();
				return doc;
			}),
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

		return from(
			this.repository.findByIdAndUpdate(id, restOfDTO).then((doc) => {
				if (!doc) {
					throw new RpcNotFoundException();
				}
				return doc;
			}),
		);
	}

	delete(FindStationByIdDTO: FindStationByIdDTO): Observable<object> {
		const {id} = FindStationByIdDTO;

		return from(
			this.repository.findByIdAndDelete(id).then((doc) => {
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
}
