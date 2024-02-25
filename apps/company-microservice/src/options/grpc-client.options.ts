import {type ClientOptions, Transport} from '@nestjs/microservices';
import {join} from 'path';

export const grpcClientOptions: (url: string) => ClientOptions = (
	url: string,
) => {
	return {
		transport: Transport.GRPC,
		options: {
			url,
			package: 'company',
			protoPath: join(process.cwd(), 'proto', 'company.proto'),
		},
	};
};
