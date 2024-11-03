import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";

const app = new Hono();

app.all("*", async (c) => {
  const { path } = c.req;
  let url = "https://api.openai.com" + path;
  if (c.req.query()) url = `${url}?${new URLSearchParams(c.req.query())}`;
  const rep = await fetch(url, {
    method: c.req.method,
    headers: c.req.raw.clone().headers,
    body: c.req.raw.body,
    ...(c.req.raw.body ? { duplex: "half" } : {}),
  });
  const respHeaderRecord = Object.fromEntries(rep.headers);
  delete respHeaderRecord["content-encoding"];
  return c.newResponse(rep.body, rep.status as StatusCode, respHeaderRecord);
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
