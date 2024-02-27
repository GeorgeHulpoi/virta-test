import {of, throwError} from 'rxjs';

export const companyPackageMock = {
	getService: () => {
		return {
			FindById: ({
				id,
				includeChildren,
			}: {
				id: string;
				includeChildren: boolean;
			}) => {
				if (id === '65db10f06548ed49254454a0') {
					if (includeChildren) {
						return of({
							id,
							name: 'Apple',
							children: [],
						});
					} else {
						return of({
							id,
							name: 'Apple',
						});
					}
				} else if (id === '65db2c9e9cc5e873cdd4b9dd') {
					return of({
						id,
						name: 'Tesla',
					});
				} else if (id === '65ddcccd1ca0b6edee493949') {
					return of({
						id: '65ddcccd1ca0b6edee493949',
						name: 'Skype',
						parent: id,
					});
				} else if (id === '65ddccaa9fbd546a7fbe154a') {
					return of({
						id,
						name: 'Microsoft',
						children: [
							{
								id: '65ddcccd1ca0b6edee493949',
								name: 'Skype',
								parent: id,
							},
							{
								id: '65ddcceeb8f2da8b593766d0',
								name: 'Azure',
								parent: id,
							},
						],
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
