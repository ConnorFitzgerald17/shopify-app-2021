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
const Shopify = require("shopify-api-node");

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
  server.use(verifyRequest());

  router.post("/api/get_selected", async (ctx) => {
    const { shop } = ctx.session;
    let shopProducts;
    await Product.findOne({ shopName: shop }, (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data!");
      }
      shopProducts = doc.id;
    });

    ctx.body = {
      products: shopProducts,
    };
    ctx.response.status = 200;
  });

  router.post("/api/remove_product", async (ctx) => {
    try {
      const { shop } = ctx.session;
      const { id } = ctx.request.body;

      await Product.findOneAndUpdate(
        { shopName: shop },
        { id, shopName: shop },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
          console.log(doc);

          doc.save();
        }
      );

      ctx.response.status = 200;
    } catch (e) {
      console.log(e);
    }
  });

  router.post("/api/update_selected", async (ctx) => {
    try {
      const { id } = ctx.request.body;
      const { shop } = ctx.session;

      await Product.findOneAndUpdate(
        { shopName: shop },
        { id, shopName: shop },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
          if (doc === null) {
            doc = new Product({
              id,
              shopName: shopName,
            });
          }

          console.log(doc);
          doc.save();
        }
      );
      ctx.body = {
        status: "success",
      };
      ctx.response.status = 200;
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit("error", err, ctx);
    }
  });

  router.post("/api/get_product_info", async (ctx) => {
    try {
      const { shop, accessToken } = ctx.session;
      const shopify = new Shopify({
        shopName: shop,
        accessToken: accessToken,
      });

      let shopProducts = [];
      let idlist;
      await Product.findOne({ shopName: shop }, (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        const { id } = doc;
        if (!id) {
          ctx.body = {
            products: false,
          };
          ctx.response.status = 200;
        } else {
          idlist = id.join();
        }
      });

      if (idlist) {
        await shopify.product
          .list({ ids: idlist, fields: ["id", "title", "tags", "images"] })
          .then((product) => {
            shopProducts = product;
          });
        ctx.body = {
          products: shopProducts,
        };
        ctx.response.status = 200;
      } else {
        ctx.body = {
          products: false,
        };
        ctx.response.status = 200;
      }
    } catch (e) {
      console.log(e);
    }
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
