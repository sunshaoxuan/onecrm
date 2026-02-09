import { createApp } from "./app.js";

const port = Number(process.env.PORT || 3100);
const server = createApp({ failOpen: process.env.AUTH_FAIL_OPEN === "true" });
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`OneCRM backend listening on http://localhost:${port}`);
});
