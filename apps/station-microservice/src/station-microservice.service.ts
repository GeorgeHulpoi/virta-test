import {Injectable} from '@nestjs/common';

@Injectable()
export class StationMicroserviceService {
	getHello(): string {
		return 'Hello World!';
	}
}
