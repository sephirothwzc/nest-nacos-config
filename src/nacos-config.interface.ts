import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ConfigUtils } from './config/config.utils';

export class NacosOptionConfig {
  @IsOptional()
  @IsString()
  server?: string;

  @IsOptional()
  @IsString()
  namespace?: string;

  @IsNumber()
  configRequestTimeout?: number;

  @IsString()
  account?: string;

  @IsString()
  password?: string;

  @IsString()
  configId?: string;

  @IsString()
  group?: string;
}

export class RootConfig<T = {}> extends ConfigUtils {
  @IsOptional()
  @IsString()
  nodeEnv?: string;

  @IsOptional()
  @Type(() => NacosOptionConfig)
  nacos?: NacosOptionConfig;

  @IsOptional()
  nacosConfig?: T;
}

type ClassType<T = any> = {
  new (...args: any[]): T;
};

export type NacosSchemaClass<T> = ClassType<RootConfig<T>>;

export type NacosConfigModuleOptions<T> = {
  /**
   * schema must have one validate
   */
  schema: NacosSchemaClass<T>;
  fileLoadOptions?: {
    basename?: string;
    searchFrom?: string;
  };
  onChange?: () => void;
};

export interface NacosConfigModuleAsyncOptions<T = any> {
  useFactory: (
    ...args: any[]
  ) => Promise<NacosConfigModuleOptions<T>> | NacosConfigModuleOptions<T>;
  inject?: any[];
}
