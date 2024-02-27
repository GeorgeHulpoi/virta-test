import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {
	FlattenMaps,
	HydratedDocument,
	Schema as MongooseSchema,
	Types,
} from 'mongoose';
import {mongooseLeanVirtuals} from 'mongoose-lean-virtuals';

export type CompanyDocument = HydratedDocument<Company>;
export type CompanyPOJO = FlattenMaps<Company>;

@Schema({
	versionKey: false,
})
export class Company {
	id: Types.ObjectId;

	@Prop({required: true})
	name: string;

	@Prop({type: MongooseSchema.Types.ObjectId, ref: 'Company'})
	parent: Company;

	children?: Company[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.plugin(mongooseLeanVirtuals);

CompanySchema.virtual('id').get(function () {
	return this._id;
});

CompanySchema.set('toJSON', {
	virtuals: true,
	getters: true,
	transform: function (doc, ret) {
		ret.id = ret._id;
		delete ret._id;
	},
});

CompanySchema.set('toObject', {
	virtuals: true,
	getters: true,
	transform: function (doc, ret) {
		ret.id = ret._id;
		delete ret._id;
	},
});
