import { injectable, BindingScope } from '@loopback/core';

@injectable({ scope: BindingScope.SINGLETON })
export class ConfigurationService {
  get(key: string): string | undefined {
    return process.env[key];
  }
}
