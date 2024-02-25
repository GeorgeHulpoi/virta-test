import {Module} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';
import {MongooseModule} from '@nestjs/mongoose';

import {grpcClientOptions as companyGrpcClientOptions} from '../../company-microservice/src/options/grpc-client.options';
import {StationModule} from './station/station.module';

@Module({
	imports: [
		MongooseModule.forRoot(process.env.DATABASE_URI),
		StationModule.register({
			imports: [
				ClientsModule.register([
					{
						...companyGrpcClientOptions(
							process.env.COMPANY_GRPC_URL,
						),
						name: 'COMPANY_PACKAGE',
					},
				]),
			],
		}),
	],
})
export class AppModule {}
