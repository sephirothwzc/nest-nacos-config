import { RootConfig } from './config/config.module';

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
