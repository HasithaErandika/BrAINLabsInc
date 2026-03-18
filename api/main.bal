// ─────────────────────────────────────────────────────────────────────────────
// main.bal — BrAIN Labs API entry point.
// Defines the HTTP listener, CORS config, and all resource function handlers.
//
// Project structure:
//   config.bal       — configurable variables
//   helpers.bal      — HTTP response helpers, auth middleware, type converters
//   modules/types/   — shared record types
//   modules/auth/    — Google OAuth 2.0 + JWT
//   modules/ai/      — HuggingFace inference helpers
//   modules/db/      — Supabase REST client + CRUD
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/log;
import brainlabs/backend.auth;
import brainlabs/backend.ai;
import brainlabs/backend.db;
import brainlabs/backend.types;

// ─── CORS + Service ────────────────────────────────────────────────────────
@http:ServiceConfig {
    cors: {
        allowOrigins: [
            "https://brainlabsinc.org",
            "https://admin.brainlabsinc.org",
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowCredentials: true,
        maxAge: 86400
    }
}
service / on new http:Listener(port) {

    // ── Health ──────────────────────────────────────────────────────────────
    resource function get health()
            returns record {|string status; string 'version;|} {
        return {status: "BrAIN Labs API running", 'version: "1.0.0"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // AUTH — Google OAuth 2.0
    // ════════════════════════════════════════════════════════════════════════

    resource function get auth/google() returns http:Response {
        string url = auth:buildGoogleAuthUrl(googleClientId, googleRedirectUri);
        http:Response res = new;
        res.setHeader("Location", url);
        res.statusCode = 302;
        return res;
    }

    resource function get auth/google/callback(string code)
            returns http:Response|error {

        types:GoogleUser|error userResult = auth:exchangeCode(
            code, googleClientId, googleClientSecret, googleRedirectUri
        );
        if userResult is error {
            log:printError("OAuth exchange failed", reason = userResult.message());
            http:Response res = new;
            res.statusCode = 502;
            res.setPayload({message: "OAuth failed: " + userResult.message()});
            return res;
        }
        types:GoogleUser user = userResult;

        string role = check db:upsertProfile(user.sub, user.email, user.name, user.picture);
        string token = check auth:issueJwt(
            user.email, user.sub, role, user.name, user.picture, jwtSecret
        );
        log:printInfo("Login", email = user.email, role = role);

        string redirect = adminRedirectUri
            + "?token=" + token
            + "&role=" + role
            + "&name=" + user.name
            + "&email=" + user.email
            + "&avatar=" + user.picture;

        http:Response res = new;
        res.setHeader("Location", redirect);
        res.statusCode = 302;
        return res;
    }

    // ════════════════════════════════════════════════════════════════════════
    // PUBLIC — brainlabsinc.org reads published content (no auth)
    // ════════════════════════════════════════════════════════════════════════

    resource function get publications() returns types:Publication[]|error {
        json raw = check db:sbGet("/rest/v1/publications?status=eq.published&order=year.desc,created_at.desc&select=*");
        return check toPublications(raw);
    }

    resource function get blog() returns types:BlogPost[]|error {
        json raw = check db:sbGet("/rest/v1/blog_posts?status=eq.published&order=published_at.desc&select=*");
        return check toBlogPosts(raw);
    }

    resource function get research() returns types:ResearchArticle[]|error {
        json raw = check db:sbGet("/rest/v1/research_articles?status=eq.published&order=created_at.desc&select=*");
        return check toResearchArticles(raw);
    }

    resource function get events() returns types:Event[]|error {
        json raw = check db:sbGet("/rest/v1/events?status=eq.published&order=event_date.asc&select=*");
        return check toEvents(raw);
    }

    resource function post events/[string id]/register(
            @http:Payload record {|string name; string email;|} body)
            returns types:MessageResponse|error {
        _ = check db:sbPost("/rest/v1/registrations",
            {event_id: id, name: body.name, email: body.email}
        );
        return {message: "Registered successfully"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Publications  /admin/publications
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/publications(http:Request req)
            returns types:Publication[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, role, _] = authResult;
        string q = role == "super_admin"
            ? "/rest/v1/publications?order=created_at.desc&select=*"
            : "/rest/v1/publications?created_by=eq." + uid + "&order=created_at.desc&select=*";
        json raw = check db:sbGet(q);
        return check toPublications(raw);
    }

    resource function post admin/publications(http:Request req,
            @http:Payload types:Publication pub)
            returns types:Publication|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        pub.created_by = uid;
        json created = check db:sbPost("/rest/v1/publications", pub.toJson());
        types:Publication[] arr = check toPublications(created);
        return arr[0];
    }

    resource function put admin/publications/[string id](http:Request req,
            @http:Payload types:Publication pub)
            returns types:Publication|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch("/rest/v1/publications?id=eq." + id, pub.toJson());
        types:Publication[] arr = check toPublications(updated);
        return arr[0];
    }

    resource function delete admin/publications/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/publications?id=eq." + id);
        return {message: "Publication deleted"};
    }

    resource function post admin/publications/summarize(http:Request req,
            @http:Payload record {|string 'abstract;|} body)
            returns types:SummarizeResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        string summary = check ai:summarize(body.'abstract, hfToken);
        return {summary};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Blog Posts  /admin/blog
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/blog(http:Request req)
            returns types:BlogPost[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, role, _] = authResult;
        string q = role == "super_admin"
            ? "/rest/v1/blog_posts?order=created_at.desc&select=*"
            : "/rest/v1/blog_posts?created_by=eq." + uid + "&order=created_at.desc&select=*";
        json raw = check db:sbGet(q);
        return check toBlogPosts(raw);
    }

    resource function post admin/blog(http:Request req,
            @http:Payload types:BlogPost post)
            returns types:BlogPost|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        post.created_by = uid;
        json created = check db:sbPost("/rest/v1/blog_posts", post.toJson());
        types:BlogPost[] arr = check toBlogPosts(created);
        return arr[0];
    }

    resource function put admin/blog/[string id](http:Request req,
            @http:Payload types:BlogPost post)
            returns types:BlogPost|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch("/rest/v1/blog_posts?id=eq." + id, post.toJson());
        types:BlogPost[] arr = check toBlogPosts(updated);
        return arr[0];
    }

    resource function delete admin/blog/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/blog_posts?id=eq." + id);
        return {message: "Blog post deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Research Articles  /admin/research
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/research(http:Request req)
            returns types:ResearchArticle[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, role, _] = authResult;
        string q = role == "super_admin"
            ? "/rest/v1/research_articles?order=created_at.desc&select=*"
            : "/rest/v1/research_articles?created_by=eq." + uid + "&order=created_at.desc&select=*";
        json raw = check db:sbGet(q);
        return check toResearchArticles(raw);
    }

    resource function post admin/research(http:Request req,
            @http:Payload types:ResearchArticle article)
            returns types:ResearchArticle|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        article.created_by = uid;
        json created = check db:sbPost("/rest/v1/research_articles", article.toJson());
        types:ResearchArticle[] arr = check toResearchArticles(created);
        return arr[0];
    }

    resource function put admin/research/[string id](http:Request req,
            @http:Payload types:ResearchArticle article)
            returns types:ResearchArticle|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch(
            "/rest/v1/research_articles?id=eq." + id, article.toJson()
        );
        types:ResearchArticle[] arr = check toResearchArticles(updated);
        return arr[0];
    }

    resource function delete admin/research/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/research_articles?id=eq." + id);
        return {message: "Research article deleted"};
    }

    resource function post admin/research/classify(http:Request req,
            @http:Payload record {|string 'abstract;|} body)
            returns types:ClassifyResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        string area = check ai:classifyResearchArea(body.'abstract, hfToken);
        return {area};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Events  /admin/events
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/events(http:Request req)
            returns types:Event[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, role, _] = authResult;
        string q = role == "super_admin"
            ? "/rest/v1/events?order=event_date.asc&select=*"
            : "/rest/v1/events?created_by=eq." + uid + "&order=event_date.asc&select=*";
        json raw = check db:sbGet(q);
        return check toEvents(raw);
    }

    resource function post admin/events(http:Request req,
            @http:Payload types:Event ev)
            returns types:Event|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        ev.created_by = uid;
        json created = check db:sbPost("/rest/v1/events", ev.toJson());
        types:Event[] arr = check toEvents(created);
        return arr[0];
    }

    resource function put admin/events/[string id](http:Request req,
            @http:Payload types:Event ev)
            returns types:Event|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch("/rest/v1/events?id=eq." + id, ev.toJson());
        types:Event[] arr = check toEvents(updated);
        return arr[0];
    }

    resource function delete admin/events/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/events?id=eq." + id);
        return {message: "Event deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Users  /admin/users  (super_admin only)
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/users(http:Request req)
            returns types:Profile[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [_, role, _] = authResult;
        if role != "super_admin" {
            return forbidden("Only super_admin may access user management");
        }
        json raw = check db:sbGet("/rest/v1/profiles?order=created_at.asc&select=*");
        return check toProfiles(raw);
    }

    resource function put admin/users/[string id]/role(http:Request req,
            @http:Payload record {|string role;|} body)
            returns types:Profile|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [_, callerRole, _] = authResult;
        if callerRole != "super_admin" {
            return forbidden("Only super_admin may change roles");
        }
        if body.role != "super_admin" && body.role != "researcher" {
            return badRequest("role must be 'super_admin' or 'researcher'");
        }
        json updated = check db:sbPatch("/rest/v1/profiles?id=eq." + id, {role: body.role});
        types:Profile[] arr = check toProfiles(updated);
        return arr[0];
    }
}
