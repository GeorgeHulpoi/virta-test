import {
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from 'class-validator';

import {CompanyService} from '../company.service';

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
	constructor(private readonly companyService: CompanyService) {}

	validate(id: any): boolean | Promise<boolean> {
		return (
			!id ||
			this.companyService
				.getModel()
				.findById(id)
				.lean()
				.exec()
				.then((doc) => doc != null)
				.catch(() => false)
		);
	}
}
