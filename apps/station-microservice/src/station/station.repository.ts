import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';

import {RpcInternalException} from '../../../../src/shared/exceptions/internal.exception';
import {NearStationsResultItem} from '../types';
import {Station, StationDocument, StationPOJO} from './station.schema';
import {CreateStationDTO} from './dtos/create-station.dto';

export interface GetStationsNearArgs {
	longitude: number;
	latitude: number;
	radius: number;
	companies?: Types.ObjectId[];
}

export type GetStationsNearResultItem = {
	distance: number;
	latitude: number;
	longitude: number;
	items: Omit<StationPOJO, 'latitude' | 'longitude'>[];
};

export interface GetStationsNearResult {
	data: GetStationsNearResultItem[];
}

@Injectable()
export class StationRepository {
	private readonly logger = new Logger(StationRepository.name);

	constructor(
		@InjectModel(Station.name)
		private readonly model: Model<StationDocument>,
	) {}

	getStationNear(
		args: GetStationsNearArgs,
	): Promise<NearStationsResultItem[]> {
		const {longitude, latitude, radius, companies} = args;

		// Would be great if moongose exports GeoNear interface ...
		const geoNear: any = {
			/**
			 * $maxDistance uses meters, therefore we convert
			 * radius (km) in meters
			 */
			distanceField: 'distance',
			maxDistance: radius * 1000,
			near: {
				type: 'Point',
				coordinates: [longitude, latitude],
			},
			spherical: true,
		};

		if (companies && companies.length !== 0) {
			geoNear['query'] = {
				company: {
					$in: companies,
				},
			};
		}

		return this.model
			.aggregate([
				{
					$geoNear: geoNear,
				},
				{
					$group: {
						_id: {
							distance: '$distance',
							latitude: {
								$last: '$location.coordinates',
							},
							longitude: {
								$first: '$location.coordinates',
							},
						},
						items: {
							$push: '$$ROOT',
						},
					},
				},
				{
					$project: {
						_id: 0,
						distance: '$_id.distance',
						latitude: '$_id.latitude',
						longitude: '$_id.longitude',
						items: '$items',
					},
				},
				{
					$sort: {
						distance: 1,
					},
				},
			])
			.exec()
			.then((result) =>
				result.map((location) => {
					location.items = location.items.map(
						this.mapStationInNearResult,
					);
					return location;
				}),
			)
			.catch(this.catchError.bind(this));
	}

	findById(id: string): Promise<StationPOJO | null> {
		return this.model
			.findById(id)
			.exec()
			.catch(this.catchError.bind(this))
			.then((doc) => {
				if (doc) {
					doc.id = Types.ObjectId.createFromHexString(doc.id);
					delete doc._id;
					return doc.toJSON();
				}
				return doc;
			});
	}

	create(createStationDTO: CreateStationDTO): Promise<StationPOJO> {
		const data: any = {
			...createStationDTO,
			company: Types.ObjectId.createFromHexString(
				createStationDTO.company,
			),
		};
		const station = new this.model(data);
		return station
			.save()
			.catch(this.catchError.bind(this))
			.then((doc) => doc.toObject());
	}

	async findByIdAndUpdate(
		id: string,
		data: Partial<CreateStationDTO>,
	): Promise<StationPOJO> {
		const doc = await this.model.findById(id).exec();

		if (!doc) {
			return null;
		}

		for (const key in data) {
			doc[key] = data[key];

			if (key === 'latitude' || key === 'longitude') {
				doc.markModified('location');
			} else if (key === 'company') {
				doc.company = Types.ObjectId.createFromHexString(data.company!);
			}
		}

		return doc.save().then((doc) => doc.toObject());
	}

	findByIdAndDelete(id: string) {
		return this.model
			.findByIdAndDelete(id)
			.exec()
			.catch(this.catchError.bind(this));
	}

	mapStationInNearResult(doc) {
		doc.id = doc._id;
		delete doc._id;
		delete doc.distance;
		delete doc.location;
		return doc;
	}

	private catchError(err: Error) {
		this.logger.error(err);
		throw new RpcInternalException();
	}
}
