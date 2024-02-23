import type {ValidationPipeOptions} from '@nestjs/common';

import {RpcBadRequestException} from '../exceptions/bad-request.exception';

export const validationOptions: ValidationPipeOptions = {
	disableErrorMessages: true,
	forbidUnknownValues: true,
	stopAtFirstError: true,
	exceptionFactory: () => {
		return new RpcBadRequestException();
	},
};
