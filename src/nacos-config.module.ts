// nacos-config.module.ts
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { NACOS_CONFIG_OPTIONS } from './nacos-config.constants';
import {
  NacosConfigModuleAsyncOptions,
  NacosConfigModuleOptions,
} from './nacos-config.interface';
import { createTypedConfigModule } from './nacos-config.loader';

@Global()
@Module({})
export class NacosConfigModule {
  static forRootAsync<T = any>(
    options: NacosConfigModuleAsyncOptions<T>,
  ): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: NACOS_CONFIG_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    // 一个承载 TypedConfigModule 的占位模块
    @Module({})
    class AsyncTypedConfigModule {
      static async createAsyncModule(
        options: NacosConfigModuleOptions<T>,
      ): Promise<DynamicModule> {
        return createTypedConfigModule(options);
      }

      static forRootAsync(): DynamicModule {
        return {
          module: AsyncTypedConfigModule,
          imports: [],
          providers: [
            {
              provide: 'ASYNC_TYPED_CONFIG_MODULE',
              inject: [NACOS_CONFIG_OPTIONS],
              useFactory: async (opts: NacosConfigModuleOptions<T>) => {
                // 这里异步创建 TypedConfigModule
                const typedModule =
                  await AsyncTypedConfigModule.createAsyncModule(opts);

                // 动态往 imports 中挂载 TypedConfigModule 的 providers、exports（Hack）
                // 注意：这里操作“伪装”，实际是否有效依赖 Nest 实现细节
                AsyncTypedConfigModule.forRootAsync().imports = [typedModule];
                AsyncTypedConfigModule.forRootAsync().exports =
                  typedModule.exports;
                AsyncTypedConfigModule.forRootAsync().providers =
                  typedModule.providers;

                return typedModule;
              },
            },
          ],
          exports: [],
        };
      }
    }

    return {
      module: NacosConfigModule,
      imports: [AsyncTypedConfigModule.forRootAsync()],
      providers: [asyncOptionsProvider],
      exports: [asyncOptionsProvider],
    };
  }
}
