import {status} from '@grpc/grpc-js';

export function shouldBeRpcNotFoundException(err) {
	expect(err.code).toEqual(status.NOT_FOUND);
}
