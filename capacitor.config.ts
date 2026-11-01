
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.gov.gestaom.app",
  appName: "GestaoM",
  webDir: "public",

  server: {
    url: "https://gestaom.com",
    cleartext: false,
  },

  android: {
    allowMixedContent: false,
  },

  plugins: {
  StatusBar: {
    overlaysWebView: false,
    backgroundColor: "#e12afb",
    style: "LIGHT",
  },
},
};

export default config;
