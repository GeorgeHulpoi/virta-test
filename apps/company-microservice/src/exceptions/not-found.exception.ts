import {status} from '@grpc/grpc-js';
import {NotFoundException} from '@nestjs/common';
import {RpcException} from '@nestjs/microservices';

import {errorObject} from './errorObject';

export class RpcNotFoundException extends RpcException {
	constructor() {
		super(
			errorObject(
				new NotFoundException().getResponse(),
				status.NOT_FOUND,
			),
		);
	}
}
