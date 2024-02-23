import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {CompanyModule} from './company/company.module';

@Module({
	imports: [MongooseModule.forRoot(process.env.DATABASE_URI), CompanyModule],
})
export class AppModule {}
