import { Auth0Client } from "@auth0/nextjs-auth0/server";

function stripScheme(value?: string) {
  return value?.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getLegacyIssuerDomain() {
  const issuer = stripScheme(process.env.AUTH0_ISSUER_BASE_URL);

  if (!issuer || issuer.startsWith("localhost")) {
    return undefined;
  }

  return issuer;
}

function getAppBaseUrl() {
  const baseUrl = process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL;

  if (!baseUrl) {
    return undefined;
  }

  if (/^https?:\/\//.test(baseUrl)) {
    return baseUrl;
  }

  return `http://${baseUrl}`;
}

const auth0Domain = stripScheme(process.env.AUTH0_DOMAIN) || getLegacyIssuerDomain();

export const isAuth0Configured = Boolean(auth0Domain);

export const auth0 = isAuth0Configured
  ? new Auth0Client({
      domain: auth0Domain,
      appBaseUrl: getAppBaseUrl(),
      authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: process.env.AUTH0_SCOPE || "openid profile email",
      },
    })
  : null;

export function getAuth0Client() {
  if (!auth0) {
    throw new Error("AUTH0_DOMAIN is required to use Auth0 authentication routes.");
  }

  return auth0;
}
