export interface NacosConfigModuleOptions {
  serverAddr: string;
  namespace?: string;
  dataId: string;
  group?: string;
  username?: string;
  password?: string;
  onChange?: (json: Record<string, any>) => void;
}