import {Injectable} from '@nestjs/common';

@Injectable()
export class CompanyMicroserviceService {
	getHello(): string {
		return 'Hello World!';
	}
}
