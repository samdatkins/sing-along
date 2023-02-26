import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createCSRF, handleFailedRequest } from "./helpers/session";
import reportWebVitals from "./reportWebVitals";
import theme from "./theme";
import axios from "axios";
import cookie from "react-cookies";

const randomCSRF = createCSRF();
axios.defaults.headers.common["X-CSRFTOKEN"] = randomCSRF;
cookie.save("csrftoken", randomCSRF, { path: "/" });

// Add a response interceptor
axios.interceptors.response.use(undefined, handleFailedRequest);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
