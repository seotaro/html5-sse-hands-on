"use strict";

require('dotenv').config();
const { join } = require('path');

(async () => {
  const fastify = require('fastify')({
    logger: true
  })

  fastify.register(require('@fastify/formbody'));

  // fastify.register(require('@fastify/compress'), {
  //   global: true,
  //   encodings: ['gzip']
  // });

  fastify.register(require('fastify-sse-v2'));

  // CORS
  console.log('CORS ORIGINS:', process.env.CORS_ORIGINS);
  fastify.register(require('@fastify/cors'), {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ['GET']  // SSE は GET のみ
  });

  // クライアントページをルートで返す。
  fastify.register(require('@fastify/static'), {
    root: join(process.cwd(), "public"),
    prefix: "/",
  });


  // SSE エンドポイント
  fastify.get('/events', (request, reply) => {
    console.log("Received Headers:", request.headers);
    console.log("Received Body:", request.body);

    reply.sse(
      // SSEストリームを開始する。

      // 非同期ジェネレーターでイベントを一定間隔で送信する
      (async function* source() {
        while (true) {
          yield { id: String((new Date()).getTime()), data: "Some message" };
          await sleep(2000);
        }
      })()
    );
  });


  const start = async () => {
    try {
      const port = process.env.PORT || 8080;
      console.log('Listening on port:', port);
      await fastify.listen({ port, host: '0.0.0.0' })
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start();
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
