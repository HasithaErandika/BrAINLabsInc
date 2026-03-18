// ─────────────────────────────────────────────────────────────────────────────
// db.bal — Supabase REST API helpers.
// Sub-module: import brainlabs/backend.db;
// Has its own configurable block — Config.toml section: [brainlabs.backend.db]
// ─────────────────────────────────────────────────────────────────────────────
import ballerina/http;
import ballerina/log;
import brainlabs/backend.types;

// ─── Configuration (populated from [brainlabs.backend.db] in Config.toml) ───
configurable string supabaseUrl        = ?;
configurable string supabaseServiceKey = ?;

// Supabase HTTP client — initialised once at module load
final http:Client supabaseClient = check new (supabaseUrl);

// ─── Header helpers ──────────────────────────────────────────────────────────

// Read-only request headers
isolated function rh() returns map<string|string[]> => {
    "apikey": supabaseServiceKey,
    "Authorization": "Bearer " + supabaseServiceKey
};

// Write headers — instructs Supabase to return the affected row(s)
isolated function wh() returns map<string|string[]> => {
    "apikey": supabaseServiceKey,
    "Authorization": "Bearer " + supabaseServiceKey,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

// ─── JSON clean — strip null/() fields before sending to Supabase ────────────
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

// ─── Core Supabase operations ────────────────────────────────────────────────

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

// ─── Profile upsert (called after Google OAuth) ──────────────────────────────
public function upsertProfile(string uid, string email, string name, string avatar)
        returns string|error {

    json payload = {id: uid, email: email, full_name: name, avatar_url: avatar};
    map<string|string[]> headers = {
        "apikey": supabaseServiceKey,
        "Authorization": "Bearer " + supabaseServiceKey,
        "Content-Type": "application/json",
        "Prefer": "return=representation,resolution=merge-duplicates"
    };
    http:Response resp = check supabaseClient->post(
        "/rest/v1/profiles?on_conflict=id", payload, headers
    );
    if resp.statusCode >= 400 {
        log:printWarn("Profile upsert failed, defaulting to researcher role");
        return "researcher";
    }
    json result = check resp.getJsonPayload();
    if result is json[] && result.length() > 0 {
        types:Profile p = check result[0].cloneWithType(types:Profile);
        return p.role;
    }
    return "researcher";
}
