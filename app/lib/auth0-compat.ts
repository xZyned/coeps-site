import { auth0, getAuth0Client } from "./auth0";

export const getSession = (...args: any[]) => {
  return (getAuth0Client().getSession as any)(...args);
};

export const withApiAuthRequired = (...args: any[]) => {
  if (!auth0) {
    return () => {
      return Response.json(
        { error: "AUTH0_DOMAIN is required to use Auth0 authentication routes." },
        { status: 500 }
      );
    };
  }

  return (getAuth0Client().withApiAuthRequired as any)(...args);
};

export const getAccessToken = async (...args: any[]) => {
  const result = await (getAuth0Client().getAccessToken as any)(...args);

  return {
    ...result,
    accessToken: result.token,
  };
};
