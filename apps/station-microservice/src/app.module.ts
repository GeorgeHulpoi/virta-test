import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {StationModule} from './station/station.module';

@Module({
	imports: [MongooseModule.forRoot(process.env.DATABASE_URI), StationModule],
})
export class AppModule {}
