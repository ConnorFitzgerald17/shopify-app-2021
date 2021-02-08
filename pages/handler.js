import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";

const instance = axios.create();
// intercept all requests on this axios instance
instance.interceptors.request.use(function (config) {
  return getSessionToken(window.app) // requires an App Bridge instance
    .then((token) => {
      // append your request headers with an authenticated token
      config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });
});
// export your axios instance to use within your app
export default instance;
