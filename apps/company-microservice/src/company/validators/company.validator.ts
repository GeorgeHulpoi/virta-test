import {
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from 'class-validator';

import {CompanyRepository} from '../company.repository';

export function CompanyExist(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'companyExist',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: CompanyExistConstraint,
		});
	};
}

@ValidatorConstraint({async: true})
export class CompanyExistConstraint implements ValidatorConstraintInterface {
	constructor(private readonly repository: CompanyRepository) {}

	validate(id: any): boolean | Promise<boolean> {
		return (
			!id ||
			this.repository
				.findById(id)
				.then((doc) => doc != null)
				.catch(() => false)
		);
	}
}
