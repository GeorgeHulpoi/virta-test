import {status} from '@grpc/grpc-js';
import {BadRequestException} from '@nestjs/common';
import {RpcException} from '@nestjs/microservices';

import {errorObject} from './errorObject';

export class RpcBadRequestException extends RpcException {
	constructor() {
		super(
			errorObject(
				new BadRequestException().getResponse(),
				status.UNKNOWN,
			),
		);
	}
}
