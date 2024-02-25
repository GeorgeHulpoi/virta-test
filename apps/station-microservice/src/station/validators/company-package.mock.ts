import {of, throwError} from 'rxjs';

export const companyPackageMock = {
	getService: () => {
		return {
			findById: ({id}: {id: string}) => {
				if (id === '65db10f06548ed49254454a0') {
					return of({
						id: id,
						name: 'Apple',
					});
				} else if (id === '65db2c9e9cc5e873cdd4b9dd') {
					return of({
						id: id,
						name: 'Tesla',
					});
				} else if (id === '65db233c003af0f3d9c51691') {
					return throwError(() => new Error('unknown'));
				} else {
					return throwError(
						() =>
							new MockError(
								JSON.stringify({
									error: {
										statusCode: 404,
									},
								}),
							),
					);
				}
			},
		};
	},
};

class MockError extends Error {
	details: string;

	constructor(details: string) {
		super();
		this.details = details;
	}
}
