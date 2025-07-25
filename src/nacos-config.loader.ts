import { DynamicModule } from '@nestjs/common';
import {
  fileLoader,
  FileLoaderOptions,
  TypedConfigModule,
} from 'nest-typed-config';

import { typedConfigLoadNacos } from './config/config.utils';
import { EmitterUtils } from './config/emitter.utils'; // 你已有的 onChange 工具
import { NacosConfigModuleOptions } from './nacos-config.interface';

export async function createTypedConfigModule<T>(
  options: NacosConfigModuleOptions<T>,
): Promise<DynamicModule> {
  const module = await TypedConfigModule.forRootAsync({
    schema: options.schema,
    load: [
      fileLoader(
        options.fileLoadOptions ||
          ({
            basename: 'env',
            searchFrom: 'conf',
          } as FileLoaderOptions),
      ),
      typedConfigLoadNacos,
    ],
  });

  if (options.onChange) {
    EmitterUtils.onConfigUpdated(options.onChange);
  }

  return module;
}
