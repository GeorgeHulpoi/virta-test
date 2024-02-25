import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {
	FlattenMaps,
	HydratedDocument,
	Schema as MongooseSchema,
} from 'mongoose';
import {mongooseLeanVirtuals} from 'mongoose-lean-virtuals';

export type StationDocument = HydratedDocument<Station>;
export type StationPOJO = FlattenMaps<Station>;

export class Location {
	@Prop({required: true, default: 'Point'})
	type: 'Point';

	@Prop({required: true, type: [Number]})
	coordinates: number[];
}

@Schema({
	versionKey: false,
	id: true,
})
export class Station {
	id: string;

	@Prop({required: true})
	name: string;

	latitude: number;

	longitude: number;

	@Prop({required: true, type: Location, index: '2dsphere'})
	location: Location;

	@Prop({required: true})
	company: MongooseSchema.Types.ObjectId;

	@Prop({required: true})
	address: string;
}

export const StationSchema = SchemaFactory.createForClass(Station);

StationSchema.plugin(mongooseLeanVirtuals);

StationSchema.virtual('latitude')
	.get(function () {
		return this.location.coordinates[1];
	})
	.set(function (v) {
		if (this.location === undefined) {
			this.location = {
				type: 'Point',
				coordinates: [0, 0],
			};
		} else if (this.location.coordinates === undefined) {
			this.location.coordinates = [0, 0];
		}

		this.location.coordinates[1] = v;
	});

StationSchema.virtual('longitude')
	.get(function () {
		return this.location.coordinates[0];
	})
	.set(function (v) {
		if (this.location === undefined) {
			this.location = {
				type: 'Point',
				coordinates: [0, 0],
			};
		} else if (this.location.coordinates === undefined) {
			this.location.coordinates = [0, 0];
		}

		this.location.coordinates[0] = v;
	});

StationSchema.set('toJSON', {
	virtuals: true,
	getters: true,
	transform: function (doc, ret) {
		delete ret.location;
		delete ret._id;
	},
});

StationSchema.set('toObject', {
	virtuals: true,
	getters: true,
	transform: function (doc, ret) {
		delete ret.location;
		delete ret._id;
	},
});
