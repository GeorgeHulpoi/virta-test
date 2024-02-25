import {status} from '@grpc/grpc-js';

export function shouldBeRpcBadRequestException(err) {
	expect(err).toBeInstanceOf(Error);
	expect(err.code).toEqual(status.UNKNOWN);
	expect(err.details).toBeDefined();
	const details = JSON.parse(err.details);
	expect(details.error?.statusCode).toEqual(400);
	expect(details.type).toEqual('object');
}
