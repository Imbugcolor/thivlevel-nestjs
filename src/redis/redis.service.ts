import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { User } from 'src/user/user.schema';
import { ClientCache } from './client.interface';
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

  async getClient(user: User): Promise<ClientCache> {
    try {
      const client = await this.cacheManager.get<string>(
        `clientId:${user._id.toString()}`,
      );

      if (client) {
        return JSON.parse(client);
      }

      const newClient: ClientCache = {
        _id: user._id.toString(),
        roles: user.role,
        socketIds: [],
      };
      return newClient;
    } catch (error) {
      console.log(error);
    }
  }

  async getClientById(userId: string): Promise<ClientCache> {
    try {
      const client = await this.cacheManager.get<string>(`clientId:${userId}`);

      return JSON.parse(client);
    } catch (error) {
      console.log(error);
    }
  }

  async getAllClients(): Promise<{ [key: string]: ClientCache }> {
    // Access the underlying Redis client
    const keys = await this.cacheManager.store.keys('clientId:*');

    const result: { [key: string]: ClientCache } = {};

    for (const key of keys) {
      const client: string = await this.cacheManager.get(key);
      result[key] = JSON.parse(client);
    }

    return result;
  }

  async addClient(user: User, socketId: string) {
    try {
      const client = await this.getClient(user);
      client.socketIds.push(socketId);
      return await this.cacheManager.set(
        `clientId:${user._id.toString()}`,
        JSON.stringify(client),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async removeClient(user: User, socketId: string): Promise<string> {
    try {
      let client = await this.getClient(user);
      const newSockerIds = client.socketIds.filter((id) => id !== socketId);
      client = { ...client, socketIds: newSockerIds };
      if (client.socketIds.length < 1) {
        await this.cacheManager.del(`clientId:${user._id.toString()}`);
        return 'OK';
      }
      await this.cacheManager.set(
        `clientId:${user._id.toString()}`,
        JSON.stringify(client),
      );
      return 'OK';
    } catch (error) {
      console.log(error);
    }
  }

  async removeKeyStartingWith(pattern: string): Promise<void> {
    const keys = await this.cacheManager.store.keys();
    const keysToDelete = keys.filter((key: string) => key.startsWith(pattern));
    await Promise.all(
      keysToDelete.map((key: string) => this.cacheManager.del(key)),
    );
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
