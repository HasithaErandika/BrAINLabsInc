// ─────────────────────────────────────────────────────────────────────────────
// types.bal — Shared record types matching the Supabase SQL schema.
// This is a sub-module so every other module can import it:
//     import brainlabs/backend.types;
// ─────────────────────────────────────────────────────────────────────────────

// ── profiles ──────────────────────────────────────────────────────────────────
public type Profile record {
    string? id = ();
    string? full_name = ();
    string? email = ();
    string? avatar_url = ();
    string role = "researcher";
    string institution = "BrAIN Labs";
    string? created_at = ();
};

// ── publications ──────────────────────────────────────────────────────────────
public type Publication record {
    string? id = ();
    string title;
    string[] authors = [];
    string? 'abstract = ();
    string? doi = ();
    int? year = ();
    string[] tags = [];
    string? pdf_url = ();
    string? venue = ();
    string status = "draft";
    string? created_by = ();
    string? created_at = ();
    string? updated_at = ();
};

// ── blog_posts ────────────────────────────────────────────────────────────────
public type BlogPost record {
    string? id = ();
    string title;
    string slug;
    string? content = ();
    string? excerpt = ();
    string? cover_url = ();
    string[] tags = [];
    string status = "draft";
    string? published_at = ();
    string? created_by = ();
    string? created_at = ();
    string? updated_at = ();
};

// ── research_articles ─────────────────────────────────────────────────────────
public type ResearchArticle record {
    string? id = ();
    string title;
    string[] authors = [];
    string? 'abstract = ();
    string? content = ();
    string? pdf_url = ();
    string[] tags = [];
    string? research_area = ();
    string status = "draft";
    string? created_by = ();
    string? created_at = ();
    string? updated_at = ();
};

// ── events ────────────────────────────────────────────────────────────────────
// Note: `type` is a reserved keyword — escape with leading single-quote.
// Ballerina serialises `'type` → "type" in JSON, matching the column name.
public type Event record {
    string? id = ();
    string title;
    string? description = ();
    string? event_date = ();
    string? location = ();
    string? 'type = ();
    string[] tags = [];
    string? banner_url = ();
    int max_capacity = 100;
    string status = "draft";
    string? created_by = ();
    string? created_at = ();
};

// ── registrations ─────────────────────────────────────────────────────────────
public type Registration record {
    string? id = ();
    string event_id;
    string name;
    string email;
    string? registered_at = ();
};

// ── Shared response shapes ────────────────────────────────────────────────────
public type MessageResponse record {|
    string message;
|};

public type SummarizeResponse record {|
    string summary;
|};

public type ClassifyResponse record {|
    string area;
|};

// ── Google OAuth user ─────────────────────────────────────────────────────────
public type GoogleUser record {|
    string sub;
    string email;
    string name;
    string picture;
|};
