// ─────────────────────────────────────────────────────────────────────────────
// helpers.bal — Response helpers, auth middleware, and type converters.
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import brainlabs/backend.types;
import brainlabs/backend.db;

// ─── HTTP response helpers ────────────────────────────────────────────────────
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

// ─── Simple session token validation ─────────────────────────────────────────
// Token format after login: "uid|email"
// Used only by protected admin endpoints to identify the caller.
function validateToken(string token) returns [string, string, string]|error {
    string[] parts = re`\|`.split(token);
    if parts.length() < 2 {
        return error("Invalid session token format. Expected uid|email.");
    }
    return [parts[0], "authenticated", parts[1]];
}

// ─── Auth middleware for HTTP requests ────────────────────────────────────────
function requireAuth(http:Request req) returns [string, string, string]|http:Response {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if authHeader is http:HeaderNotFoundError || !authHeader.startsWith("Bearer ") {
        return unauthorized("Missing or invalid Authorization header");
    }

    string token = authHeader.substring(7);
    var result = validateToken(token);
    if result is error {
        return unauthorized("Invalid or expired session. Please log in again.");
    }
    return result;
}

function requireAdminForPublish(string uid, string status) returns http:Response?|error {
    if status == "PUBLISHED" {
        types:Member caller = check db:getMemberByAuthId(uid);
        if db:getMemberRole(caller) != "super_admin" {
            return forbidden("Only super admins can publish content.");
        }
    }
    return ();
}

// ─── Type converters ──────────────────────────────────────────────────────────
isolated function toResearchPublications(json data) returns types:ResearchPublication[]|error =>
    check data.cloneWithType();

isolated function toBlogs(json data) returns types:Blog[]|error =>
    check data.cloneWithType();

isolated function toEvents(json data) returns types:Event[]|error =>
    check data.cloneWithType();

isolated function toGrants(json data) returns types:Grant[]|error =>
    check data.cloneWithType();

isolated function toMembers(json data) returns types:Member[]|error =>
    check data.cloneWithType();

isolated function toProjects(json data) returns types:Project[]|error => check data.cloneWithType();
isolated function toProjectItems(json data) returns types:ProjectItem[]|error => check data.cloneWithType();
isolated function toTutorialSeries(json data) returns types:TutorialSeries[]|error => check data.cloneWithType();
isolated function toTutorialPages(json data) returns types:TutorialPage[]|error => check data.cloneWithType();

