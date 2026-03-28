import ballerina/http;
import ballerina/log;
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
    // AUTH — Email/password login via Supabase Auth REST
    // Returns JWT + member profile. Frontend never calls Supabase directly.
    // ════════════════════════════════════════════════════════════════════════

    resource function post auth/login(@http:Payload types:AuthLoginPayload body)
            returns record {|string token; types:MeResponse member;|}|http:Response|error {
        
        // 1. Domain Validation
        string email = body.email.toLowerAscii();
        boolean isValidDomain = email.endsWith("@sliit.lk") || 
                                email.endsWith("@my.sliit.lk") || 
                                email.endsWith("@gmail.com") ||
                                email.endsWith("@brainlabsinc.org");
        
        if !isValidDomain {
            log:printWarn("Domain validation failed", email = email);
            return unauthorized("Only @sliit.lk, @my.sliit.lk, @gmail.com or @brainlabsinc.org emails are allowed.");
        }

        // 2. Call Supabase Auth password grant
        types:LoginResponse|error loginResult = db:supabaseLogin(body.email, body.password);
        if loginResult is error {
            log:printError("Supabase login error", 'error = loginResult);
            return unauthorized("Invalid email or password");
        }
        if loginResult.'error != () {
            log:printWarn("Supabase login failed", reason = loginResult.error_description);
            return unauthorized(loginResult.error_description ?: "Login failed");
        }

        // 3. Extract UID directly from Supabase user object — no JWT parsing needed
        types:SupabaseUserDetails? userDetails = loginResult.user;
        if userDetails is () {
            log:printError("Supabase login returned no user object");
            return unauthorized("Authentication failed: no user data returned");
        }
        string uid = userDetails.id;
        string capturedEmail = userDetails.email;

        // 4. Ensure member profile exists (auto-provision if first login)
        string name = capturedEmail.substring(0, capturedEmail.indexOf("@") ?: capturedEmail.length());
        types:Member member = check db:ensureMemberExists(uid, capturedEmail, name);

        // 5. Build response — role comes from the members.role column in DB
        string memberRole = db:getMemberRole(member);
        types:MeResponse me = {
            id: member.id,
            auth_user_id: member.auth_user_id,
            slug: member.slug,
            name: member.name,
            position: member.position,
            contact_email: member.contact_email ?: capturedEmail,
            image_url: member.image_url,
            status: member.status,
            role: memberRole
        };

        // 6. Issue a simple uid|email session token (no JWT)
        string token = uid + "|" + (member.contact_email ?: capturedEmail);
        return {token: token, member: me};
    }



    // ════════════════════════════════════════════════════════════════════════
    // PUBLIC — brainlabsinc.org reads published content (no auth)
    // ════════════════════════════════════════════════════════════════════════

    resource function get publications() returns types:ResearchPublication[]|error {
        json raw = check db:sbGet("/rest/v1/research_publications?status=eq.PUBLISHED&order=publication_year.desc,created_at.desc&select=*");
        return toResearchPublications(raw);
    }

    resource function get blog() returns types:Blog[]|error {
        json raw = check db:sbGet("/rest/v1/blogs?status=eq.PUBLISHED&order=published_date.desc&select=*");
        return toBlogs(raw);
    }

    resource function get events() returns types:Event[]|error {
        json raw = check db:sbGet("/rest/v1/events?status=eq.PUBLISHED&order=created_at.asc&select=*");
        return toEvents(raw);
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
    // ADMIN — Current user profile (used after login to verify session)
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/me(http:Request req) returns types:MeResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, email] = authResult;

        types:Member|error memberResult = db:getMemberByAuthId(uid);
        if memberResult is error {
            return forbidden("User is authenticated but not a registered member of BrAIN Labs.");
        }
        return {
            id: memberResult.id,
            auth_user_id: memberResult.auth_user_id,
            slug: memberResult.slug,
            name: memberResult.name,
            position: memberResult.position,
            contact_email: memberResult.contact_email ?: email,
            image_url: memberResult.image_url,
            status: memberResult.status,
            role: db:getMemberRole(memberResult)
        };
    }

    resource function put admin/me(http:Request req, @http:Payload map<json> profile) returns types:MeResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, email] = authResult;

        types:Member target = check db:getMemberByAuthId(uid);
        
        json updatePayload = {
            name: profile["name"] is string ? profile["name"] : target.name,
            position: profile["position"],
            contact_email: profile["contact_email"],
            image_url: profile["image_url"],
            university: profile["university"],
            country: profile["country"],
            linkedin_url: profile["linkedin_url"],
            summary: profile["summary"]
        };

        _ = check db:sbPatch("/rest/v1/members?id=eq." + (target.id ?: ""), updatePayload);
        
        return {
            id: target.id ?: "",
            auth_user_id: target.auth_user_id,
            slug: target.slug,
            name: profile["name"] is string ? <string>profile["name"] : target.name,
            position: profile["position"] is string ? <string>profile["position"] : (),
            contact_email: profile["contact_email"] is string ? <string>profile["contact_email"] : email,
            image_url: profile["image_url"] is string ? <string>profile["image_url"] : (),
            status: target.status,
            role: db:getMemberRole(target)
        };
    }

    resource function post admin/me/password(http:Request req, @http:Payload types:PasswordChangePayload body) returns http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, email] = authResult;

        // 1. Verify current password by attempting a login
        var loginCheck = db:supabaseLogin(email, body.current_password);
        if loginCheck is error || loginCheck.'error != () {
            return unauthorized("Current password is incorrect");
        }

        // 2. Update password via admin API
        check db:supabaseUpdateUser(uid, {password: body.new_password});
        
        http:Response res = new;
        res.statusCode = 200;
        res.setPayload({message: "Password updated successfully"});
        return res;
    }

    // ─── CV Profile Generic Endpoints ──────────────────────────────────────────

    resource function get admin/me/cv(http:Request req) returns json|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        types:Member target = check db:getMemberByAuthId(uid);

        string selectQuery = "*,research_interests(*),academic_qualifications(*),career_experiences(*,career_responsibilities(*)),honours_and_awards(*),memberships(*),ongoing_research(*)";
        json result = check db:sbGet("/rest/v1/members?id=eq." + (target.id ?: "") + "&select=" + selectQuery);
        
        if result is json[] && result.length() > 0 {
            return result[0];
        }
        return badRequest("CV profile not found");
    }

    resource function post admin/me/cv/[string section](http:Request req, @http:Payload json payload) returns json|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        types:Member target = check db:getMemberByAuthId(uid);

        string[] allowed = ["research_interests", "academic_qualifications", "career_experiences", "honours_and_awards", "memberships", "ongoing_research", "career_responsibilities"];
        if allowed.indexOf(section) is () { return badRequest("Invalid CV table"); }

        if payload is map<json> {
            if section != "career_responsibilities" {
                payload["member_id"] = target.id;
            }
            return check db:sbPost("/rest/v1/" + section, payload);
        }
        return badRequest("Payload must be a JSON object");
    }

    resource function put admin/me/cv/[string section]/[string id](http:Request req, @http:Payload json payload) returns json|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }

        string[] allowed = ["research_interests", "academic_qualifications", "career_experiences", "honours_and_awards", "memberships", "ongoing_research", "career_responsibilities"];
        if allowed.indexOf(section) is () { return badRequest("Invalid CV table"); }

        // Strip id and member_id to prevent tampering
        if payload is map<json> {
            _ = payload.removeIfHasKey("id");
            _ = payload.removeIfHasKey("member_id");
            return check db:sbPatch("/rest/v1/" + section + "?id=eq." + id, payload);
        }
        return badRequest("Payload must be a JSON object");
    }

    resource function delete admin/me/cv/[string section]/[string id](http:Request req) returns error?|http:Response {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }

        string[] allowed = ["research_interests", "academic_qualifications", "career_experiences", "honours_and_awards", "memberships", "ongoing_research", "career_responsibilities"];
        if allowed.indexOf(section) is () { return badRequest("Invalid CV table"); }

        _ = check db:sbDelete("/rest/v1/" + section + "?id=eq." + id);
        return;
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Publications
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/publications(http:Request req)
            returns types:ResearchPublication[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/research_publications?order=created_at.desc&select=*");
        return toResearchPublications(raw);
    }

    resource function post admin/publications(http:Request req,
            @http:Payload types:ResearchPublication pub)
            returns types:ResearchPublication|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        
        var pubCheck = requireAdminForPublish(uid, pub.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        pub.member_id = member.id;
        json created = check db:sbPost("/rest/v1/research_publications", pub.toJson());
        types:ResearchPublication[] arr = check toResearchPublications(created);
        return arr[0];
    }

    resource function put admin/publications/[string id](http:Request req,
            @http:Payload types:ResearchPublication pub)
            returns types:ResearchPublication|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        
        var pubCheck = requireAdminForPublish(uid, pub.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/research_publications?id=eq." + id, pub.toJson());
        types:ResearchPublication[] arr = check toResearchPublications(updated);
        return arr[0];
    }

    resource function delete admin/publications/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/research_publications?id=eq." + id);
        return {message: "Publication deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Blog Posts
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/blog(http:Request req)
            returns types:Blog[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/blogs?order=created_at.desc&select=*");
        return toBlogs(raw);
    }

    resource function post admin/blog(http:Request req,
            @http:Payload types:Blog post)
            returns types:Blog|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, post.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        post.member_id = member.id;
        json created = check db:sbPost("/rest/v1/blogs", post.toJson());
        types:Blog[] arr = check toBlogs(created);
        return arr[0];
    }

    resource function put admin/blog/[string id](http:Request req,
            @http:Payload types:Blog post)
            returns types:Blog|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, post.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/blogs?id=eq." + id, post.toJson());
        types:Blog[] arr = check toBlogs(updated);
        return arr[0];
    }

    resource function delete admin/blog/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/blogs?id=eq." + id);
        return {message: "Blog post deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Events
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/events(http:Request req)
            returns types:Event[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/events?order=created_at.desc&select=*");
        return toEvents(raw);
    }

    resource function post admin/events(http:Request req,
            @http:Payload types:Event ev)
            returns types:Event|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, ev.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        ev.member_id = member.id;
        json created = check db:sbPost("/rest/v1/events", ev.toJson());
        types:Event[] arr = check toEvents(created);
        return arr[0];
    }

    resource function put admin/events/[string id](http:Request req,
            @http:Payload types:Event ev)
            returns types:Event|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, ev.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

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
    // ADMIN — Grants
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/grants(http:Request req)
            returns types:Grant[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/grants?order=created_at.desc&select=*");
        return toGrants(raw);
    }

    resource function post admin/grants(http:Request req,
            @http:Payload types:Grant g)
            returns types:Grant|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, g.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        g.member_id = member.id;
        json created = check db:sbPost("/rest/v1/grants", g.toJson());
        types:Grant[] arr = check toGrants(created);
        return arr[0];
    }

    resource function put admin/grants/[string id](http:Request req,
            @http:Payload types:Grant g)
            returns types:Grant|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, g.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/grants?id=eq." + id, g.toJson());
        types:Grant[] arr = check toGrants(updated);
        return arr[0];
    }

    resource function delete admin/grants/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/grants?id=eq." + id);
        return {message: "Grant deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Members Management (Super Admin only)
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/members(http:Request req)
            returns types:Member[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/members?order=name.asc&select=*");
        return toMembers(raw);
    }

    resource function post admin/members(http:Request req,
            @http:Payload types:Member m)
            returns types:Member|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json created = check db:sbPost("/rest/v1/members", m.toJson());
        types:Member[] arr = check toMembers(created);
        return arr[0];
    }

    resource function patch admin/members/[string id](http:Request req,
            @http:Payload record {|string status;|} body)
            returns types:Member|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;
        
        var pubCheck = requireAdminForPublish(uid, body.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/members?id=eq." + id, {status: body.status});
        types:Member[] arr = check toMembers(updated);
        return arr[0];
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Projects
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/projects(http:Request req)
            returns types:Project[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/projects?order=created_at.desc&select=*");
        return toProjects(raw);
    }

    resource function post admin/projects(http:Request req,
            @http:Payload types:Project p)
            returns types:Project|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, p.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        p.member_id = member.id;
        json created = check db:sbPost("/rest/v1/projects", p.toJson());
        types:Project[] arr = check toProjects(created);
        return arr[0];
    }

    resource function put admin/projects/[string id](http:Request req,
            @http:Payload types:Project p)
            returns types:Project|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, p.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/projects?id=eq." + id, p.toJson());
        types:Project[] arr = check toProjects(updated);
        return arr[0];
    }

    resource function delete admin/projects/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/projects?id=eq." + id);
        return {message: "Project deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Project Items
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/project\-items(http:Request req, string project_id)
            returns types:ProjectItem[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/project_items?project_id=eq." + project_id + "&order=display_order.asc&select=*");
        return toProjectItems(raw);
    }

    resource function post admin/project\-items(http:Request req,
            @http:Payload types:ProjectItem pi)
            returns types:ProjectItem|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json created = check db:sbPost("/rest/v1/project_items", pi.toJson());
        types:ProjectItem[] arr = check toProjectItems(created);
        return arr[0];
    }

    resource function put admin/project\-items/[string id](http:Request req,
            @http:Payload types:ProjectItem pi)
            returns types:ProjectItem|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch("/rest/v1/project_items?id=eq." + id, pi.toJson());
        types:ProjectItem[] arr = check toProjectItems(updated);
        return arr[0];
    }

    resource function delete admin/project\-items/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/project_items?id=eq." + id);
        return {message: "Project item deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Tutorials Series
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/tutorials(http:Request req)
            returns types:TutorialSeries[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/tutorial_series?order=created_at.desc&select=*");
        return toTutorialSeries(raw);
    }

    resource function post admin/tutorials(http:Request req,
            @http:Payload types:TutorialSeries ts)
            returns types:TutorialSeries|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, ts.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        types:Member member = check db:getMemberByAuthId(uid);
        ts.member_id = member.id;
        json created = check db:sbPost("/rest/v1/tutorial_series", ts.toJson());
        types:TutorialSeries[] arr = check toTutorialSeries(created);
        return arr[0];
    }

    resource function put admin/tutorials/[string id](http:Request req,
            @http:Payload types:TutorialSeries ts)
            returns types:TutorialSeries|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        var [uid, _, _] = authResult;

        var pubCheck = requireAdminForPublish(uid, ts.status);
        if pubCheck is http:Response { return pubCheck; }
        if pubCheck is error { return badRequest("Failed to verify user role"); }

        json updated = check db:sbPatch("/rest/v1/tutorial_series?id=eq." + id, ts.toJson());
        types:TutorialSeries[] arr = check toTutorialSeries(updated);
        return arr[0];
    }

    resource function delete admin/tutorials/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/tutorial_series?id=eq." + id);
        return {message: "Tutorial series deleted"};
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADMIN — Tutorial Pages
    // ════════════════════════════════════════════════════════════════════════

    resource function get admin/tutorial\-pages(http:Request req, string series_id)
            returns types:TutorialPage[]|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json raw = check db:sbGet("/rest/v1/tutorial_pages?series_id=eq." + series_id + "&order=display_order.asc&select=*");
        return toTutorialPages(raw);
    }

    resource function post admin/tutorial\-pages(http:Request req,
            @http:Payload types:TutorialPage tp)
            returns types:TutorialPage|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json created = check db:sbPost("/rest/v1/tutorial_pages", tp.toJson());
        types:TutorialPage[] arr = check toTutorialPages(created);
        return arr[0];
    }

    resource function put admin/tutorial\-pages/[string id](http:Request req,
            @http:Payload types:TutorialPage tp)
            returns types:TutorialPage|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        json updated = check db:sbPatch("/rest/v1/tutorial_pages?id=eq." + id, tp.toJson());
        types:TutorialPage[] arr = check toTutorialPages(updated);
        return arr[0];
    }

    resource function delete admin/tutorial\-pages/[string id](http:Request req)
            returns types:MessageResponse|http:Response|error {
        var authResult = requireAuth(req);
        if authResult is http:Response { return authResult; }
        check db:sbDelete("/rest/v1/tutorial_pages?id=eq." + id);
        return {message: "Tutorial page deleted"};
    }

}

