import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  fileLoader,
  FileLoaderOptions,
  TypedConfigModule,
} from 'nest-typed-config';

import { RootConfig } from './config/config.module';
import { typedConfigLoadNacos } from './config/config.utils';
import { EmitterUtils } from './config/emitter.utils';

type ClassType<T = any> = {
  new (...args: any[]): T;
};

export type NacosSchemaClass<T> = ClassType<RootConfig<T>>;

export type NacosConfigModuleOptions<T> = {
  /**
   * schema must have one validate
   */
  schema: NacosSchemaClass<T>;
  /**
   * default value
   * {
   *    basename: 'env', // 基础名称为 .env (匹配文件开头)
   *    // searchPlaces: [
   *    //    '.env.development.yaml', // 直接指定要加载的配置文件
   *    // ],
   *    searchFrom: 'conf', // 指定搜索路径为 conf 目录 (非常重要)
   * }
   */
  fileLoadOptions?: FileLoaderOptions | undefined;
  /**
   * nacos 订阅修改事件
   * @param value
   * @returns
   */
  onChange?: (value: RootConfig<T>) => void;
};

@Global()
@Module({})
export class NacosConfigModule {
  static forRootAsync<T>(
    options: NacosConfigModuleOptions<T>,
  ): Promise<DynamicModule> {
    const ConfigModule: Promise<DynamicModule> = TypedConfigModule.forRootAsync(
      {
        schema: options.schema,
        load: [
          fileLoader(
            options.fileLoadOptions || {
              basename: 'env', // 基础名称为 .env (匹配文件开头)
              //  searchPlaces: [
              //    '.env.development.yaml', // 直接指定要加载的配置文件
              //  ],
              searchFrom: 'conf', // 指定搜索路径为 conf 目录 (非常重要)
            },
          ),
          typedConfigLoadNacos,
        ],
      },
    );
    // 绑定change 事件
    options.onChange && EmitterUtils.onConfigUpdated(options.onChange);
    return ConfigModule;
  }
}
