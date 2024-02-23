import {type ClientOptions, Transport} from '@nestjs/microservices';
import {join} from 'path';

export const grpcClientOptions: ClientOptions = {
	transport: Transport.GRPC,
	options: {
		url: `localhost:${process.env.PORT || 5000}`,
		package: 'company',
		protoPath:
			process.env.NODE_ENV === 'production'
				? join(__dirname, 'proto', 'company.proto')
				: join(
						__dirname,
						'..',
						'..',
						'..',
						'..',
						'proto',
						'company.proto',
					),
	},
};
