import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import bodyParser from "koa-body";
import Product from "./models/product";
import cors from "@koa/cors";
import morgan from "morgan";

const mongoose = require("mongoose");

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;

var url = process.env.MONGO_CONNECTION;

mongoose.connect(url, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(cors({ origin: "*" }));
  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop } = ctx.state.shopify;

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.October19,
    })
  );

  server.use(bodyParser());

  router.post("/api/test", (ctx) => {
    ctx.res.statusCode = 200;
    ctx.body = "API Route";
  });

  router.post("/api/update_selected", (ctx) => {
    // const { shop } = ctx.session; // try {
    // console.log(shop);
    // let { id, shopName } = ctx.request.body;
    console.log(ctx.request.body);
    // Product.findOneAndUpdate(
    //   { shopName: shopName },
    //   { id, shopName },
    //   { new: true },
    //   (err, doc) => {
    //     if (err) {
    //       console.log("Something wrong when updating data!");
    //     }

    //     console.log(doc);
    //   }
    // );
    ctx.body = {
      status: "success",
    };
    ctx.response.status = 200;
    // } catch (e) {
    //   console.log(e);
    //   ctx.response.status = 400;
    // }
  });

  router.get("(.*)", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);

    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
