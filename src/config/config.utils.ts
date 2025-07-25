import { Logger } from '@nestjs/common';
import * as yaml from 'js-yaml';
import { camelCase, get, isPlainObject } from 'lodash';
import { NacosConfigClient } from 'nacos';

import { RootConfig } from '../nacos-config.interface';
import { EmitterUtils } from './emitter.utils';

let configClient: NacosConfigClient;
let subscribed = false;
/**
 * 对象键名转换为 camelCase
 * @param obj
 * @returns
 */
function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  } else if (isPlainObject(obj)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = camelCase(key);
      result[camelKey] = keysToCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

/**
 * 自动解析 JSON 或 YAML 内容
 */
function parseConfigContent(content: string): any {
  try {
    const result = JSON.parse(content);
    console.log('[Config Parser] Detected JSON format');
    return keysToCamelCase(result);
  } catch {
    try {
      const result = yaml.load(content);
      console.log('[Config Parser] Detected YAML format');
      return keysToCamelCase(result);
    } catch {
      throw new Error('配置内容无法解析为 JSON 或 YAML');
    }
  }
}

/**
 * nacos 加载配置并订阅
 */
export const typedConfigLoadNacos = async (value: RootConfig) => {
  const logger = new Logger('typedConfigLoadNacos');
  if (!value.nacos?.server) {
    logger.warn('Nacos 配置未启用，跳过初始化');
    return value;
  }

  configClient = new NacosConfigClient({
    serverAddr: value.nacos.server,
    namespace: value.nacos.namespace,
    requestTimeout: value.nacos.configRequestTimeout,
    username: value.nacos.account,
    password: value.nacos.password,
  });

  // 获取配置内容
  const configRaw = await configClient.getConfig(
    value.nacos.configId,
    value.nacos.group,
  );
  const nacosConfig = parseConfigContent(configRaw);

  value = Object.assign(value, { nacosConfig });
  EmitterUtils.emitLoadConfigEnd(value);
  logger.debug(JSON.stringify(value), 'value');

  if (!subscribed) {
    subscribed = true;
    // 订阅变更
    configClient.subscribe(
      { dataId: value.nacos?.configId, group: value.nacos?.group },
      (content: string) => {
        try {
          const updatedValue = parseConfigContent(content);
          value = Object.assign(value, { nacosConfig: updatedValue });
          logger.debug(JSON.stringify(value), 'subscribe');
          EmitterUtils.emitLoadConfigEnd(value);
        } catch (err) {
          logger.error('Nacos 配置解析失败: ' + get(err, 'message'));
        }
      },
    );
  }

  return value;
};

/**
 * App 启动后订阅（用于支持动态刷新）
 */
export const rootConfigSubscribe = async (value: RootConfig) => {
  const logger = new Logger('rootConfigSubscribe');
  if (!configClient) {
    logger.warn('Nacos client 未初始化，无法订阅');
    return;
  }

  configClient.subscribe(
    { dataId: value.nacos?.configId, group: value.nacos?.group },
    (content: string) => {
      try {
        const updatedValue = parseConfigContent(content);
        value = Object.assign(value, { nacosValue: updatedValue });
        logger.log(JSON.stringify(value), 'subscribe');
        EmitterUtils.emitLoadConfigEnd(value);
      } catch (err) {
        logger.error('Nacos 订阅配置解析失败: ' + get(err, 'message'));
      }
    },
  );
};

/**
 * 提供动态配置读取工具
 */
export class ConfigUtils {
  constructor() {}

  get<T = string>(key: string) {
    return get(this, key) as T;
  }
}
