import {HttpErrorByCode} from '@nestjs/common/utils/http-error-by-code.util';
import {Observable, throwError} from 'rxjs';

export function catchRpcException(err): Observable<never> {
	if ('details' in err) {
		const details = JSON.parse(err.details);
		const {
			error: {statusCode},
		} = details;

		if (statusCode in HttpErrorByCode) {
			return throwError(() => new HttpErrorByCode[statusCode]());
		}
	}
	return throwError(() => err);
}
