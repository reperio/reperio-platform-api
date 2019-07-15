const redis = require("redis");
const {promisify} = require("util");
const Config = require('../config');

class RedisHelper {
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;

        this.redisClient = redis.createClient(Config.redis);

        this.asyncRedisClient = {
            get: promisify(this.redisClient.get).bind(this.redisClient),
            set: promisify(this.redisClient.set).bind(this.redisClient),
            del: promisify(this.redisClient.del).bind(this.redisClient),
            sadd: promisify(this.redisClient.sadd).bind(this.redisClient),
            srem: promisify(this.redisClient.srem).bind(this.redisClient),
            setnx: promisify(this.redisClient.setnx).bind(this.redisClient),
            smembers: promisify(this.redisClient.smembers).bind(this.redisClient),
            srandmember: promisify(this.redisClient.srandmember).bind(this.redisClient),
            expire: promisify(this.redisClient.expire).bind(this.redisClient)
        };
    }

    async addOTP(otp, jwt) {
        const redisKeyName = `otp:${otp}`;
        await this.asyncRedisClient.set(redisKeyName, jwt);
        await this.asyncRedisClient.expire(redisKeyName, Config.redisOtpExpirationSeconds);
    }

    async getJWTForOTP(otp) {
        const redisKeyName = `otp:${otp}`;
        const jwt = await this.asyncRedisClient.get(redisKeyName);
        await this.asyncRedisClient.del(redisKeyName);
        return jwt;
    }

    async addJWT(jwt) {
        const redisKeyName = `jwt:${jwt}`;
        await this.asyncRedisClient.set(redisKeyName, jwt);
        await this.asyncRedisClient.expire(redisKeyName, Config.redisJWTExpirationSeconds);
    }
}

module.exports = RedisHelper;