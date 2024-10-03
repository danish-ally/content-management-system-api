const Redis = require("ioredis");

const redisOptions = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
};
const redis = new Redis(redisOptions);



function connectToRedis() {
    const redis = new Redis(redisOptions);

    redis.on("error", (err) => {
        console.error("Redis connection error:", err);
        redis.disconnect(); // Disconnect on error
        setTimeout(connectToRedis, 2000); // Retry connection after 2 seconds
    });

    redis.on("connect", () => {
        console.log("Connected to Redis");
    });

}

connectToRedis();

module.exports = redis;