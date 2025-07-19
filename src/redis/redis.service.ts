import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import IORedis, { Redis } from "ioredis";

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  getClient() {
    if (!this.client) {
      this.client = new IORedis(this.configService.get("REDIS_URL"));
    }
    return this.client;
  }
}
