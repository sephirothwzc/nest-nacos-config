import { DynamicModule, Module, Provider } from '@nestjs/common';

import { NACOS_CONFIG_OPTIONS } from './nacos-config.constants';
import { NacosConfigModuleAsyncOptions } from './nacos-config.interface';
import { createTypedConfigModule } from './nacos-config.loader';

@Module({})
export class NacosConfigBuilderModule {
  static async registerAsync<T = any>(
    options: NacosConfigModuleAsyncOptions<T>,
  ): Promise<DynamicModule> {
    const optionsProvider: Provider = {
      provide: NACOS_CONFIG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const asyncOptions = await options.useFactory();

    const typedModule = await createTypedConfigModule(asyncOptions);

    return {
      module: NacosConfigBuilderModule,
      imports: [typedModule],
      providers: [optionsProvider],
      exports: [optionsProvider, ...typedModule.exports!],
    };
  }
}
