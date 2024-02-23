import {Controller, UseFilters} from '@nestjs/common';

import {ExceptionFilter} from './filters/rpc-exception.filter';

@UseFilters(ExceptionFilter)
@Controller()
export class CompanyController {}
