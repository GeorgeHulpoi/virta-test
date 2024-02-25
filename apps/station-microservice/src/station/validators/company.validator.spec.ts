import type {ClientGrpc} from '@nestjs/microservices';

import {RpcInternalException} from '../../../../../src/shared/exceptions/internal.exception';
import {companyPackageMock} from './company-package.mock';
import {IsCompanyConstraint} from './company.validator';

describe('IsCompanyConstraint', () => {
	let isCompanyConstraint: IsCompanyConstraint;

	beforeEach(() => {
		isCompanyConstraint = new IsCompanyConstraint(
			companyPackageMock as unknown as ClientGrpc,
		);
	});

	it('should return false', async () => {
		const result = await isCompanyConstraint.validate(
			'65db10f06548ed49254454a1',
		);
		expect(result).toBe(false);
	});

	it('should return true', async () => {
		const result = await isCompanyConstraint.validate(
			'65db10f06548ed49254454a0',
		);
		expect(result).toBe(true);
	});

	it('should throw RpcInternalException', (done) => {
		isCompanyConstraint
			.validate('65db233c003af0f3d9c51691')
			.then(() => {
				done('should throw RpcInternalException');
			})
			.catch((err) => {
				expect(err).toBeInstanceOf(RpcInternalException);
				done();
			});
	});
});
