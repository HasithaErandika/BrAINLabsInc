// ─────────────────────────────────────────────────────────────────────────────
// types.bal — Shared record types matching schema.sql exactly.
// ─────────────────────────────────────────────────────────────────────────────

// ── members ──────────────────────────────────────────────────────────────────
public type Member record {
    string? id = ();
    string? auth_user_id = ();
    string slug;
    string name;
    string? position = ();
    string? university = ();
    string? country = ();
    string? contact_email = ();
    string? linkedin_url = ();
    string? image_url = ();
    string? summary = ();
    string status = "DRAFT";
    string role = "researcher";
    string? created_at = ();
    string? updated_at = ();
};

// ── research_interests ────────────────────────────────────────────────────────
public type ResearchInterest record {
    string? id = ();
    string? member_id = ();
    string category;
    string interest_name;
    int display_order = 0;
};

// ── academic_qualifications ───────────────────────────────────────────────────
public type AcademicQualification record {
    string? id = ();
    string? member_id = ();
    string degree;
    string institution;
    string period;
    string? details = ();
    int display_order = 0;
};

// ── career_experiences ────────────────────────────────────────────────────────
public type CareerExperience record {
    string? id = ();
    string? member_id = ();
    string category;
    string role;
    string institution;
    string period;
    int display_order = 0;
};

// ── career_responsibilities ───────────────────────────────────────────────────
public type CareerResponsibility record {
    string? id = ();
    string career_experience_id;
    string description;
    int display_order = 0;
};

// ── honours_and_awards ────────────────────────────────────────────────────────
public type HonoursAndAward record {
    string? id = ();
    string? member_id = ();
    string description;
    int display_order = 0;
};

// ── memberships ───────────────────────────────────────────────────────────────
public type Membership record {
    string? id = ();
    string? member_id = ();
    string organization_name;
    int display_order = 0;
};

// ── ongoing_research ──────────────────────────────────────────────────────────
public type OngoingResearch record {
    string? id = ();
    string? member_id = ();
    string research_title;
    int display_order = 0;
};

// ── research_publications ─────────────────────────────────────────────────────
public type ResearchPublication record {
    string? id = ();
    string? member_id = ();
    string title;
    string authors;
    string? venue = ();
    int? publication_year = ();
    string? doi = ();
    string? link = ();
    string? 'abstract = ();
    string status = "DRAFT";
    string? created_at = ();
    string? updated_at = ();
};

// ── blogs ─────────────────────────────────────────────────────────────────────
public type Blog record {
    string? id = ();
    string? member_id = ();
    string slug;
    string title;
    string? excerpt = ();
    string? author_name = ();
    string? published_date = ();
    string? image_url = ();
    string[] tags = [];
    string content;
    string status = "DRAFT";
    string? created_at = ();
    string? updated_at = ();
};

// ── events ────────────────────────────────────────────────────────────────────
public type Event record {
    string? id = ();
    string? member_id = ();
    string title;
    string? event_type = ();
    string? event_date = ();
    string? description = ();
    string? link = ();
    string status = "DRAFT";
    string? created_at = ();
};

// ── grants ────────────────────────────────────────────────────────────────────
public type Grant record {
    string? id = ();
    string? member_id = ();
    string title;
    string agency;
    string? award_year = ();
    string? description = ();
    string status = "DRAFT";
    string? created_at = ();
};

// ── projects ──────────────────────────────────────────────────────────────────
public type Project record {
    string? id = ();
    string? member_id = ();
    string category;
    string? icon_name = ();
    string? description = ();
    string status = "DRAFT";
    string? created_at = ();
    string? updated_at = ();
};

public type ProjectItem record {
    string? id = ();
    string project_id;
    string title;
    string description;
    int display_order = 0;
};

// ── tutorial_series ───────────────────────────────────────────────────────────
public type TutorialSeries record {
    string? id = ();
    string? member_id = ();
    string slug;
    string title;
    string? description = ();
    string status = "DRAFT";
    string? created_at = ();
    string? updated_at = ();
};

// ── tutorial_pages ────────────────────────────────────────────────────────────
public type TutorialPage record {
    string? id = ();
    string series_id;
    string? parent_id = ();
    string slug;
    string title;
    string? content = ();
    int display_order = 0;
    string? created_at = ();
    string? updated_at = ();
};

// ── Shared response shapes ────────────────────────────────────────────────────
public type MessageResponse record {|
    string message;
|};

public type SummarizeResponse record {|
    string summary;
|};

// ── Auth response (returned by /auth/login) ───────────────────────────────────
public type SupabaseUserDetails record {
    string id;
    string email;
};

public type LoginResponse record {
    string access_token;
    string token_type;
    int expires_in;
    SupabaseUserDetails? user = ();
    string? 'error = ();
    string? error_description = ();
};

public type AuthLoginPayload record {|
    string email;
    string password;
|};

public type PasswordChangePayload record {|
    string current_password;
    string new_password;
|};

public type MeResponse record {
    string? id = ();
    string? auth_user_id = ();
    string slug;
    string name;
    string? position = ();
    string? contact_email = ();
    string? image_url = ();
    string status;
    string role;
};
