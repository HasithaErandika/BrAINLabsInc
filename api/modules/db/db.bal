// ─────────────────────────────────────────────────────────────────────────────
// db.bal — Supabase REST API helpers.
// Sub-module: import brainlabs/backend.db;
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/log;
import brainlabs/backend.types;

// ─── Configuration ───────────────────────────────────────────────────────────
configurable string supabaseUrl        = ?;
configurable string supabaseServiceKey = ?;
// Role mapping: comma-separated list of auth_user_ids that are super_admins
// e.g. "uuid1,uuid2"
// [DEPRECATED] Moved to DB-stored role column.
// configurable string superAdminIds = "";

// Supabase HTTP client
final http:Client supabaseClient = check new (supabaseUrl);

// ─── Header helpers ──────────────────────────────────────────────────────────
isolated function rh() returns map<string|string[]> => {
    "apikey": supabaseServiceKey,
    "Authorization": "Bearer " + supabaseServiceKey
};

isolated function wh() returns map<string|string[]> => {
    "apikey": supabaseServiceKey,
    "Authorization": "Bearer " + supabaseServiceKey,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

// ─── JSON cleaner — strip null fields before sending to Supabase ──────────────
isolated function cleanJson(json payload) returns json {
    if payload !is map<json> {
        return payload;
    }
    map<json> cleaned = {};
    foreach var [k, v] in (<map<json>>payload).entries() {
        if v !is () {
            cleaned[k] = v;
        }
    }
    return cleaned;
}

// ─── Core Supabase operations ─────────────────────────────────────────────────

public function sbGet(string path) returns json|error {
    http:Response resp = check supabaseClient->get(path, rh());
    if resp.statusCode >= 400 {
        string body = check resp.getTextPayload();
        log:printError("Supabase GET error", statusCode = resp.statusCode, path = path, body = body);
        return error("Supabase error [" + resp.statusCode.toString() + "]: " + body);
    }
    return resp.getJsonPayload();
}

public function sbPost(string path, json body) returns json|error {
    http:Response resp = check supabaseClient->post(path, cleanJson(body), wh());
    if resp.statusCode >= 400 {
        string errBody = check resp.getTextPayload();
        log:printError("Supabase POST error", statusCode = resp.statusCode, path = path, body = errBody);
        return error("Supabase error [" + resp.statusCode.toString() + "]: " + errBody);
    }
    return resp.getJsonPayload();
}

public function sbPatch(string path, json body) returns json|error {
    http:Response resp = check supabaseClient->patch(path, cleanJson(body), wh());
    if resp.statusCode >= 400 {
        string errBody = check resp.getTextPayload();
        log:printError("Supabase PATCH error", statusCode = resp.statusCode, path = path, body = errBody);
        return error("Supabase error [" + resp.statusCode.toString() + "]: " + errBody);
    }
    return resp.getJsonPayload();
}

public function sbDelete(string path) returns error? {
    http:Response resp = check supabaseClient->delete(path, (), rh());
    if resp.statusCode >= 400 {
        string errBody = check resp.getTextPayload();
        log:printError("Supabase DELETE error", statusCode = resp.statusCode, path = path, body = errBody);
        return error("Supabase error [" + resp.statusCode.toString() + "]: " + errBody);
    }
}

// ─── Supabase Auth — password login (used by /auth/login endpoint) ────────────
// Calls Supabase Auth REST API on behalf of the user.
public function supabaseLogin(string email, string password) returns types:LoginResponse|error {
    // Use the Supabase Auth endpoint with anon key for user-facing auth
    http:Response resp = check supabaseClient->post(
        "/auth/v1/token?grant_type=password",
        {email: email, password: password},
        {
            "apikey": supabaseServiceKey,
            "Content-Type": "application/json"
        }
    );
    
    if resp.statusCode >= 400 {
        json|error body = resp.getJsonPayload();
        string bodyStr = body is json ? body.toJsonString() : "[No JSON Body]";
        log:printWarn("Supabase Auth rejection", statusCode = resp.statusCode, body = bodyStr);
        
        // If it's a 4xx from Supabase, try to wrap it in a LoginResponse for the caller
        if body is json {
            var lr = body.cloneWithType(types:LoginResponse);
            if lr is types:LoginResponse {
                return lr;
            }
        }
        return error("Supabase Auth failed [" + resp.statusCode.toString() + "]: " + bodyStr);
    }

    json body = check resp.getJsonPayload();
    return body.cloneWithType(types:LoginResponse);
}

// ─── Supabase Auth — Update user (Admin) ──────────────────────────────────────
public function supabaseUpdateUser(string authUserId, json body) returns error? {
    http:Response resp = check supabaseClient->put(
        "/auth/v1/admin/users/" + authUserId,
        body,
        wh()
    );
    if resp.statusCode >= 400 {
        string errBody = check resp.getTextPayload();
        log:printError("Supabase Admin Update error", statusCode = resp.statusCode, uid = authUserId, body = errBody);
        return error("Password update failed: " + errBody);
    }
}

// ─── Member operations ────────────────────────────────────────────────────────

public function getMemberByAuthId(string authUserId) returns types:Member|error {
    json result = check sbGet("/rest/v1/members?auth_user_id=eq." + authUserId + "&select=*");
    if result is json[] && result.length() > 0 {
        return result[0].cloneWithType(types:Member);
    }
    return error("Member not found for auth_user_id: " + authUserId);
}

// Ensures a member record exists in the public.members table.
// Called during login to auto-provision new members.
public function ensureMemberExists(string authUserId, string email, string name) returns types:Member|error {
    var existing = getMemberByAuthId(authUserId);
    if existing is types:Member {
        return existing;
    }

    // Create new skeleton member
    string localPart = email.substring(0, email.indexOf("@") ?: email.length());
    types:Member newMember = {
        auth_user_id: authUserId,
        slug: localPart + "-" + authUserId.substring(0, 4), // avoid collisions
        name: name != "" ? name : localPart,
        contact_email: email,
        status: "DRAFT", // New members start as Draft until profile completed
        role: "researcher" // Default role
    };

    json created = check sbPost("/rest/v1/members", newMember.toJson());
    if created is json[] && created.length() > 0 {
        return created[0].cloneWithType(types:Member);
    }
    return error("Failed to create member record");
}

// ─── Role resolution ──────────────────────────────────────────────────────────
// Roles are now stored directly in the public.members table.
public function getMemberRole(types:Member member) returns string => member.role;
