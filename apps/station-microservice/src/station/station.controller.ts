import {Controller, UseFilters} from '@nestjs/common';

import {ExceptionFilter} from '../../../../shared/filters/rpc-exception.filter';
import {StationService} from './station.service';

@UseFilters(ExceptionFilter)
@Controller()
export class StationController {
	constructor(private readonly stationService: StationService) {}
}
