import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {StationController} from './station.controller';
import {Station, StationSchema} from './station.schema';
import {StationService} from './station.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Station.name, schema: StationSchema},
		]),
	],
	controllers: [StationController],
	providers: [StationService],
})
export class StationModule {}
