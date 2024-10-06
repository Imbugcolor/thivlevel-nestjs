import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async deleteTransaction(key: string): Promise<string> {
    try {
      await this.cacheManager.del(key);
      return 'OK';
    } catch (error) {
      console.log(error);
    }
  }

  async setTransaction<T>(key: string, value: T): Promise<string> {
    try {
      await this.cacheManager.store.set(key, JSON.stringify(value));
      return 'OK';
    } catch (error) {
      console.log(error);
    }
  }

  async getTransaction<T>(key: string): Promise<T> {
    try {
      const data: string = await this.cacheManager.get(key);
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  }

  async setOtp(email: string, otp: string): Promise<void> {
    try {
      await this.cacheManager.set(email, otp);
    } catch (error) {
      console.log(error);
    }
  }

  async getOtp(email: string): Promise<string> {
    try {
      return await this.cacheManager.get(email);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteOtp(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.log(error);
    }
  }
}
