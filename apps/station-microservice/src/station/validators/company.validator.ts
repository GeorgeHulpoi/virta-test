import {Inject, Logger} from '@nestjs/common';
import {ClientGrpc} from '@nestjs/microservices';
import {
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	type ValidatorConstraintInterface,
} from 'class-validator';
import {catchError, firstValueFrom, map, of, throwError} from 'rxjs';

import {RpcInternalException} from '../../../../../src/shared/exceptions/internal.exception';
import {CompanyService} from '../../../../company-microservice/src/types';

export function IsCompany(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'isCompany',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: IsCompanyConstraint,
		});
	};
}

@ValidatorConstraint({async: true})
export class IsCompanyConstraint implements ValidatorConstraintInterface {
	private readonly logger = new Logger(IsCompanyConstraint.name);

	constructor(@Inject('COMPANY_PACKAGE') private client: ClientGrpc) {}

	validate(id: string): Promise<boolean> {
		const companyService =
			this.client.getService<CompanyService>('CompanyService');

		return firstValueFrom(
			companyService.FindById({id}).pipe(
				map(() => true),
				catchError((err) => {
					if ('details' in err) {
						const details = JSON.parse(err.details);
						const {
							error: {statusCode},
						} = details;

						if (statusCode === 404) {
							return of(false);
						}
					}

					this.logger.error(err);
					return throwError(() => new RpcInternalException());
				}),
			),
		);
	}
}
