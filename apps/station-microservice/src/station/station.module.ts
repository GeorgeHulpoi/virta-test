import {DynamicModule, Module, ModuleMetadata} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import {StationController} from './station.controller';
import {Station, StationSchema} from './station.schema';
import {StationService} from './station.service';
import {IsCompanyConstraint} from './validators/company.validator';
import {StationRepository} from './station.repository';

export interface StationModuleConfig {
	imports?: ModuleMetadata['imports'];
	providers?: ModuleMetadata['providers'];
}

@Module({})
export class StationModule {
	static register(config?: StationModuleConfig): DynamicModule {
		return {
			module: StationModule,
			imports: [
				...(config?.imports || []),
				MongooseModule.forFeature([
					{name: Station.name, schema: StationSchema},
				]),
			],
			controllers: [StationController],
			providers: [
				...(config?.providers || []),
				StationRepository,
				StationService,
				IsCompanyConstraint,
			],
		};
	}
}
