import { Type } from '@nestjs/common';

export interface NacosConfigModuleOptions<T = any> {
  schema: Type<T>;
  fileLoadOptions?: {
    basename?: string;
    searchFrom?: string;
  };
  onChange?: () => void;
}

export interface NacosConfigModuleAsyncOptions<T = any> {
  useFactory: (
    ...args: any[]
  ) => Promise<NacosConfigModuleOptions<T>> | NacosConfigModuleOptions<T>;
  inject?: any[];
}
