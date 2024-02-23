import {registerDecorator, ValidationOptions} from 'class-validator';
import {Types} from 'mongoose';

export function IsObjectId(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'isObjectId',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return !value || Types.ObjectId.isValid(value);
				},
			},
		});
	};
}
