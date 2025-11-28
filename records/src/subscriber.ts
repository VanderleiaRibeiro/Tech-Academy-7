import Redis from "ioredis";

export function setupSubscriber() {
  const sub = new Redis(
    process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST || "redis"}:${
        process.env.REDIS_PORT || 6379
      }`
  );

  sub.subscribe("habit.events", () => {
    console.log("[SUBSCRIBER] Records está escutando habit.events...");
  });

  sub.on("message", (channel, message) => {
    console.log("\n🔥 EVENTO RECEBIDO NO RECORDS");
    console.log("Canal:", channel);
    console.log("Mensagem:", message);
    console.log("--------------------\n");
  });
}
