import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ConfigUtils } from './config.utils';

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
