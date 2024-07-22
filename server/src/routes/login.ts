import { Router } from "express";

import {
  clearCookies,
  exchangeToken,
  redirectToSpotify,
  setAuthCookies,
  validateState,
} from "../middlewares/login";

const router = Router();

// navigate to /login if / path is found

router.get("/login", setAuthCookies, redirectToSpotify);

router.get("/callback", validateState, clearCookies, exchangeToken);

export default router;
