import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  const inline = process.argv.find((value) => value.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : fallback;
}

const root = resolve(readArg("root", "starter"));
const port = Number(readArg("port", "4173"));
const host = readArg("host", "127.0.0.1");

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`Preview root does not exist: ${root}`);
  process.exit(1);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const candidate = resolve(join(root, normalize(relative).replace(/^[/\\]+/, "")));

  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  if (!existsSync(candidate) || !statSync(candidate).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": mimeTypes[extname(candidate).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  createReadStream(candidate).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving ${root}`);
  console.log(`Preview: http://${host}:${port}/`);
});
