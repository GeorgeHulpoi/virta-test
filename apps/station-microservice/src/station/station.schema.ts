import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {
	FlattenMaps,
	HydratedDocument,
	Schema as MongooseSchema,
} from 'mongoose';
import {mongooseLeanVirtuals} from 'mongoose-lean-virtuals';

export type StationDocument = HydratedDocument<Station>;
export type StationPOJO = FlattenMaps<Station>;

@Schema({
	versionKey: false,
	id: true,
	toJSON: {
		virtuals: true,
	},
	toObject: {
		virtuals: true,
	},
})
export class Station {
	id: string;

	@Prop({required: true})
	name: string;

	@Prop({required: true, index: '2dsphere'})
	coordinates: number[];

	@Prop({required: true})
	company: MongooseSchema.Types.ObjectId;

	@Prop({required: true})
	address: string;
}

export const StationSchema = SchemaFactory.createForClass(Station);

StationSchema.plugin(mongooseLeanVirtuals);

StationSchema.set('toJSON', {
	transform: function (doc, ret) {
		delete ret._id;
	},
});

StationSchema.set('toObject', {
	transform: function (doc, ret) {
		delete ret._id;
	},
});
