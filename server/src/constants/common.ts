export const CLIENT_ID = process.env.CLIENT_ID;
export const REDIRECT_URI = process.env.REDIRECT_URI;
export const CODE_VERIFIER_KEY =
  process.env.CODE_VERIFIER_KEY ?? "codeVerifierKey";
export const STATE_KEY = process.env.STATE_KEY ?? "spotifyStateKey";
export const USER_SCOPE = "user-read-private user-read-email";
export const FRONTEND_URI = process.env.FRONTEND_URI;
