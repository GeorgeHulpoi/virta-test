import {CompanyExistConstraint} from './company.validator';

describe('CompanyExistConstraint', () => {
	let companyExistConstraint: CompanyExistConstraint;

	it('should return false', async () => {
		companyExistConstraint = new CompanyExistConstraint({
			findById: () => Promise.resolve(null),
		} as any);

		const result = await companyExistConstraint.validate(
			'65db10f06548ed49254454a1',
		);
		expect(result).toBe(false);
	});

	it('should return true', async () => {
		companyExistConstraint = new CompanyExistConstraint({
			findById: () => Promise.resolve({name: 'Apple'}),
		} as any);

		const result = await companyExistConstraint.validate(
			'65db10f06548ed49254454a0',
		);
		expect(result).toBe(true);
	});

	it('should return false when error is thrown', async () => {
		companyExistConstraint = new CompanyExistConstraint({
			findById: () => Promise.reject(new Error()),
		} as any);

		const result = await companyExistConstraint.validate(
			'65db10f06548ed49254454a0',
		);
		expect(result).toBe(false);
	});
});
