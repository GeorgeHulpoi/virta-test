import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {Station, StationSchema} from './station.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Station.name, schema: StationSchema},
		]),
	],
	controllers: [],
	providers: [],
})
export class StationModule {}
