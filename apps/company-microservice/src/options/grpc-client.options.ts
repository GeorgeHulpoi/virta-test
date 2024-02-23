import {type ClientOptions, Transport} from '@nestjs/microservices';
import {join} from 'path';

export const grpcClientOptions: ClientOptions = {
	transport: Transport.GRPC,
	options: {
		url: `localhost:${process.env.PORT || 5000}`,
		package: 'company',
		protoPath: join(process.cwd(), 'proto', 'company.proto'),
	},
};
