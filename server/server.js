const Koa = require("koa");
const app = new Koa();

const config = require("./config/default");

const path = require("path");
const fs = require("fs");

const handlers = fs.readdirSync(path.join(__dirname, "handlers")).sort();
handlers.forEach(handler => require("./handlers/" + handler).init(app));

// can be split into files too
const Router = require("koa-router");

const router = new Router();

// *** Auth API handlers ***
const chartDataHandlers = fs
  .readdirSync(path.join(__dirname, "api/chartData"))
  .sort();

chartDataHandlers.forEach(handler =>
  require("./api/chartData/" + handler).init(router)
);

const environment = process.env.NODE_ENV;

if (environment === "development" || environment === "test") {
  const devHandlers = fs
    .readdirSync(path.join(__dirname, "devHandlers"))
    .sort();
  devHandlers.forEach(handler => require("./devHandlers/" + handler).init(app));

  router.get("*", async function(ctx) {
    ctx.body = ctx.render(__dirname + "/templates/dev.pug");
  });
} else {
  router.get("*", async function(ctx) {
    ctx.body = ctx.render(__dirname + "/templates/index.pug");
  });
}

app.use(router.routes());

module.exports = app;
