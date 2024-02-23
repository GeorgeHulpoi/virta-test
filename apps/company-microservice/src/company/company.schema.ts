import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {
	FlattenMaps,
	HydratedDocument,
	Schema as MongooseSchema,
} from 'mongoose';
import {mongooseLeanVirtuals} from 'mongoose-lean-virtuals';

export type CompanyDocument = HydratedDocument<Company>;
export type CompanyPOJO = FlattenMaps<Company>;

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
export class Company {
	id: string;

	@Prop({required: true})
	name: string;

	@Prop({type: MongooseSchema.Types.ObjectId, ref: 'Company'})
	parent: Company;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.plugin(mongooseLeanVirtuals);

CompanySchema.set('toJSON', {
	transform: function (doc, ret) {
		delete ret._id;
	},
});

CompanySchema.set('toObject', {
	transform: function (doc, ret) {
		delete ret._id;
	},
});
