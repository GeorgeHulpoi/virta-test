import {Module} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';

import {grpcClientOptions as companyGrpcClientOptions} from '../../company-microservice/src/options/grpc-client.options';
import {grpcClientOptions as stationGrpcClientOptions} from '../../station-microservice/src/options/grpc-client.options';
import {CompaniesController} from './controllers/companies.controller';
import {StationsController} from './controllers/stations.controller';

@Module({
	imports: [
		ClientsModule.register([
			{
				...companyGrpcClientOptions(process.env.COMPANY_GRPC_URL),
				name: 'COMPANY_PACKAGE',
			},
			{
				...stationGrpcClientOptions(process.env.STATION_GRPC_URL),
				name: 'STATION_PACKAGE',
			},
		]),
	],
	controllers: [CompaniesController, StationsController],
})
export class ApiGatewayModule {}
