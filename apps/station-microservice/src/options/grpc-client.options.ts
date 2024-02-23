import {type ClientOptions, Transport} from '@nestjs/microservices';
import {join} from 'path';

export const grpcClientOptions: ClientOptions = {
	transport: Transport.GRPC,
	options: {
		url: `localhost:${process.env.PORT || 5001}`,
		package: 'station',
		protoPath: join(process.cwd(), 'proto', 'station.proto'),
	},
};
