import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

import {Station, StationDocument} from './station.schema';

@Injectable()
export class StationService {
	constructor(
		@InjectModel(Station.name)
		private readonly model: Model<StationDocument>,
	) {}

	getModel(): Model<StationDocument> {
		return this.model;
	}
}
