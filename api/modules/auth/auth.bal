// ─────────────────────────────────────────────────────────────────────────────
// auth.bal — Google OAuth 2.0 helpers + JWT issue/validate.
// Sub-module: import brainlabs/backend.auth;
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/jwt;
import ballerina/log;
import brainlabs/backend.types;

// Module-level Google API clients
final http:Client googleTokenCl = check new ("https://oauth2.googleapis.com");
final http:Client googleUserCl  = check new ("https://www.googleapis.com");

// ─── Internal response record types ──────────────────────────────────────────
type GoogleTokenResponse record {
    string access_token;
    string? token_type = ();
};

type GoogleUserInfo record {
    string sub;
    string email;
    string name;
    string picture;
};

// ─── Build the Google authorisation URL ──────────────────────────────────────
public function buildGoogleAuthUrl(string clientId, string redirectUri) returns string =>
    "https://accounts.google.com/o/oauth2/v2/auth"
    + "?client_id=" + clientId
    + "&redirect_uri=" + redirectUri
    + "&response_type=code"
    + "&scope=openid%20email%20profile"
    + "&access_type=offline"
    + "&prompt=select_account";

// ─── Exchange authorisation code → GoogleUser ────────────────────────────────
public function exchangeCode(
        string code,
        string clientId,
        string clientSecret,
        string redirectUri)
        returns types:GoogleUser|error {

    string formBody = "code=" + code
        + "&client_id=" + clientId
        + "&client_secret=" + clientSecret
        + "&redirect_uri=" + redirectUri
        + "&grant_type=authorization_code";

    http:Response tokenResp = check googleTokenCl->post(
        "/token", formBody,
        {"Content-Type": "application/x-www-form-urlencoded"}
    );
    if tokenResp.statusCode != 200 {
        string body = check tokenResp.getTextPayload();
        log:printError("Google token exchange failed", status = tokenResp.statusCode, body = body);
        return error("Google OAuth failed: " + body);
    }

    json tokenJson = check tokenResp.getJsonPayload();
    GoogleTokenResponse tokenData = check tokenJson.cloneWithType(GoogleTokenResponse);

    http:Response userResp = check googleUserCl->get(
        "/oauth2/v3/userinfo",
        {"Authorization": "Bearer " + tokenData.access_token}
    );
    if userResp.statusCode != 200 {
        return error("Failed to get Google user info: " + userResp.statusCode.toString());
    }

    json userJson = check userResp.getJsonPayload();
    GoogleUserInfo info = check userJson.cloneWithType(GoogleUserInfo);
    return {sub: info.sub, email: info.email, name: info.name, picture: info.picture};
}

// ─── Issue HS256 JWT with role, uid, name, avatar claims ─────────────────────
public function issueJwt(
        string email,
        string uid,
        string role,
        string name,
        string avatar,
        string secret)
        returns string|error {

    jwt:IssuerConfig config = {
        issuer:       "brainlabs-api",
        username:     email,
        audience:     ["brainlabs-admin"],
        expTime:      86400,
        customClaims: {"role": role, "uid": uid, "name": name, "avatar": avatar},
        signatureConfig: {algorithm: jwt:HS256, config: secret}
    };
    return jwt:issue(config);
}

// ─── Validate Bearer JWT → [uid, role, email] ────────────────────────────────
public function validateToken(string authHeader, string secret)
        returns [string, string, string]|error {

    string[] parts = re` `.split(authHeader.trim());
    if parts.length() < 2 || parts[0].toLowerAscii() != "bearer" {
        return error("Invalid Authorization header — expected 'Bearer <token>'");
    }
    string token = parts[1];

    jwt:ValidatorConfig cfg = {
        issuer:          "brainlabs-api",
        audience:        "brainlabs-admin",
        signatureConfig: {secret: secret}
    };
    jwt:Payload payload = check jwt:validate(token, cfg);
    string email = payload.sub ?: "";

    anydata uidAny  = payload["uid"];
    anydata roleAny = payload["role"];

    string uid  = uidAny  is string ? uidAny  : "";
    string role = roleAny is string ? roleAny : "researcher";

    if uid == "" {
        return error("JWT missing uid claim");
    }
    return [uid, role, email];
}
