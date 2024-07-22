import { RequestHandler } from "express";
import qs from "querystring";

import axios from "axios";
import {
  CLIENT_ID,
  CODE_VERIFIER_KEY,
  FRONTEND_URI,
  REDIRECT_URI,
  STATE_KEY,
  USER_SCOPE,
} from "../constants/common";
import { SPOTIFY_AUTH_USER_API, SPOTIFY_GET_TOKEN_API } from "../constants/url";
import {
  generateCodeChallenge,
  generateEncryptedString,
  generateRandomString,
} from "../utils/auth";

export const setAuthCookies: RequestHandler = (req, res, next) => {
  const state = generateRandomString(16);
  const codeVerifier = generateEncryptedString(128);
  const [codeChallenge, codeChallengeMethod] =
    generateCodeChallenge(codeVerifier);

  res.cookie(STATE_KEY, state);
  res.cookie(CODE_VERIFIER_KEY, codeVerifier);

  (req as any).auth = {
    state,
    codeChallenge,
    codeChallengeMethod,
  };

  next();
};

export const redirectToSpotify: RequestHandler = (req, res) => {
  const { state, codeChallenge, codeChallengeMethod } = (req as any).auth;

  console.log({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: USER_SCOPE,
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge_method: codeChallengeMethod,
    code_challenge: codeChallenge,
  });

  const queryParams = qs.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: USER_SCOPE,
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge_method: codeChallengeMethod,
    code_challenge: codeChallenge,
  });

  res.redirect(`${SPOTIFY_AUTH_USER_API}?${queryParams}`);
};

export const validateState: RequestHandler = (req, res, next) => {
  const state = req.query.state as string | null;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  console.log(state, storedState);

  if (state === null || state !== storedState) {
    const queryParams = qs.stringify({ error: "state_mismatch" });
    res.redirect(`/#${queryParams}`);
  } else {
    next();
  }
};

export const clearCookies: RequestHandler = (_req, res, next) => {
  res.clearCookie(STATE_KEY);
  res.clearCookie(CODE_VERIFIER_KEY);

  next();
};

export const exchangeToken: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string | null;
    const codeVerifier = req.cookies ? req.cookies[CODE_VERIFIER_KEY] : null;

    const body = qs.stringify({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const response = await axios({
      method: "POST",
      url: SPOTIFY_GET_TOKEN_API,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: body,
    });

    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;

    const queryParams = qs.stringify({ access_token, refresh_token });

    res.redirect(`${FRONTEND_URI}/#${queryParams}`);
  } catch (error) {
    next(error);
  }
};
