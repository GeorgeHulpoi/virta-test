import {status} from '@grpc/grpc-js';
import {InternalServerErrorException} from '@nestjs/common';
import {RpcException} from '@nestjs/microservices';

import {errorObject} from './errorObject';

export class RpcInternalException extends RpcException {
	constructor() {
		super(
			errorObject(
				new InternalServerErrorException().getResponse(),
				status.INTERNAL,
			),
		);
	}
}
