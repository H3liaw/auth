import {createClient, RedisClient} from 'redis';
import {Injectable, Scope} from "@nestjs/common";

@Injectable({
    scope: Scope.DEFAULT
})
export class RedisConnection {
    redis: RedisClient;

    createInstance(config) {

        this.redis = createClient({host: config.REDIS_HOST, port: config.REDIS_PORT, db: config.REDIS_DB});
        this.redis.on('error', error => {
            console.log(`AUTHENTICATION: Redis Connection Is Failed By ${config.REDIS_HOST}:${config.REDIS_PORT}:${config.REDIS_DB} : ${error}`);
        });

        this.redis.on('connect', () => {
            console.log(`AUTHENTICATION: Redis Connected On ${config.REDIS_HOST}:${config.REDIS_PORT}:${config.REDIS_DB}`);
        });
        return this.redis;
    }


    getInstance(config) {
        if (!this.redis) {
            this.redis = this.createInstance(config);
        }
        return this.redis;
    }

}
