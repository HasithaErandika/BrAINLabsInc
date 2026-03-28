// ─────────────────────────────────────────────────────────────────────────────
// config.bal — All configurable variables for the root module.
// Values loaded from Config.toml at startup. Use `?` for required secrets.
// ─────────────────────────────────────────────────────────────────────────────

configurable int    port               = 8080;
configurable string jwtSecret          = ?;    // Supabase JWT Secret
configurable string hfToken            = "";   // optional — enables AI features
// Comma-separated list of Supabase auth_user_ids that have super_admin role.
// Example: "uuid-1,uuid-2"
// The 'role' field is NOT in the schema — role is resolved at runtime here.
configurable string superAdminIds      = "";
