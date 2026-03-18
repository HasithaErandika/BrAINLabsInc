// ─────────────────────────────────────────────────────────────────────────────
// helpers.bal — HTTP response helpers, auth middleware, and type converters.
// Root module file — shares configurable vars from config.bal.
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/log;
import brainlabs/backend.auth;
import brainlabs/backend.types;

// ─── HTTP response helpers ──────────────────────────────────────────────────
isolated function unauthorized(string msg = "Unauthorized") returns http:Response {
    http:Response res = new;
    res.statusCode = 401;
    res.setPayload({message: msg});
    return res;
}

isolated function forbidden(string msg = "Forbidden") returns http:Response {
    http:Response res = new;
    res.statusCode = 403;
    res.setPayload({message: msg});
    return res;
}

isolated function badRequest(string msg) returns http:Response {
    http:Response res = new;
    res.statusCode = 400;
    res.setPayload({message: msg});
    return res;
}

// ─── Auth middleware ────────────────────────────────────────────────────────
// Returns [uid, role, email] or an http:Response (401) if token is invalid.
function requireAuth(http:Request req)
        returns [string, string, string]|http:Response {

    string|http:HeaderNotFoundError hdr = req.getHeader("Authorization");
    if hdr is http:HeaderNotFoundError {
        return unauthorized("Missing Authorization header");
    }
    [string, string, string]|error result = auth:validateToken(hdr, jwtSecret);
    if result is error {
        log:printWarn("JWT rejected", reason = result.message());
        return unauthorized("Invalid or expired token");
    }
    return result;
}

// ─── Supabase response converters ───────────────────────────────────────────
// Avoid cloneWithType(Type[]) parse ambiguity — return type inferred from LHS.
isolated function toPublications(json data) returns types:Publication[]|error =>
    check data.cloneWithType();

isolated function toBlogPosts(json data) returns types:BlogPost[]|error =>
    check data.cloneWithType();

isolated function toResearchArticles(json data) returns types:ResearchArticle[]|error =>
    check data.cloneWithType();

isolated function toEvents(json data) returns types:Event[]|error =>
    check data.cloneWithType();

isolated function toProfiles(json data) returns types:Profile[]|error =>
    check data.cloneWithType();
