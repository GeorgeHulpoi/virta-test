import {Module} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';

import {grpcClientOptions as companyGrpcClientOptions} from '../../company-microservice/src/options/grpc-client.options';
import {CompaniesController} from './controllers/companies.controller';

@Module({
	imports: [
		ClientsModule.register([
			{
				...companyGrpcClientOptions,
				name: 'COMPANY_PACKAGE',
			},
		]),
	],
	controllers: [CompaniesController],
})
export class ApiGatewayModule {}
