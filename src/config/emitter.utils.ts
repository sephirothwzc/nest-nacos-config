import { EventEmitter2 } from '@nestjs/event-emitter';

import { RootConfig } from '../nacos-config.interface';

// 自定义事件名
const LOAD_CONFIG_END = 'loadConfigEnd';

// ✅ 类型安全增强：指定事件签名
interface TypedConfigEvents<T = any> {
  [LOAD_CONFIG_END]: (value: RootConfig<T>) => void;
}

// ✅ 自定义 Emitter，提供类型绑定和 emit 封装
class TypedConfigEmitter<T = any> extends EventEmitter2 {
  private rootConfig: RootConfig<T> | undefined = undefined;

  emitLoadConfigEnd(value: RootConfig<T>) {
    this.rootConfig = value;
    this.emit(LOAD_CONFIG_END, value);
  }

  /**
   * 绑定
   * @param callback
   */
  onConfigUpdated(callback: (value: RootConfig<T>) => void) {
    this.on(LOAD_CONFIG_END, callback);
  }

  /**
   * 解绑
   * @param callback
   */
  offConfigUpdated(callback: (value: RootConfig<T>) => void) {
    this.off(LOAD_CONFIG_END, callback);
  }

  subscribeLoadConfigEnd(): Promise<RootConfig<T>> {
    return new Promise((resolve) => {
      if (this.rootConfig) {
        resolve(this.rootConfig);
      }
      this.on(LOAD_CONFIG_END, (rootConfig) => resolve(rootConfig));
    });
  }
}

// ✅ 导出单例工具
export const EmitterUtils = new TypedConfigEmitter();
