// ─────────────────────────────────────────────────────────────────────────────
// config.bal — All configurable variables for the root module.
// Values loaded from Config.toml at startup. Use `?` for required secrets.
// ─────────────────────────────────────────────────────────────────────────────

configurable int    port               = 8080;
configurable string googleClientId     = ?;
configurable string googleClientSecret = ?;
configurable string googleRedirectUri  = ?;
configurable string allowedEmailDomain = "brainlabsinc.org";
configurable string adminRedirectUri   = "https://admin.brainlabsinc.org/auth/callback";
configurable string jwtSecret          = ?;
configurable string hfToken            = "";   // optional — enables AI features
