-- BrAIN Labs - Complete Environment Seed Data Script
-- This script ensures Members, Roles, Assignments, and Content all exist.

BEGIN;

DO $$
DECLARE
    admin_id INT;
    researcher_id INT;
    ra_id INT;
    i INT;
    statuses approval_status_enum[] := ARRAY['DRAFT', 'PENDING_RESEARCHER', 'PENDING_ADMIN', 'APPROVED'];
    status_to_use approval_status_enum;
    creator_id INT;
BEGIN
    -- 1. ENSURE MEMBERS EXIST (Upsert by auth_user_id)
    -- Admin
    INSERT INTO member (first_name, second_name, contact_email, slug, auth_user_id)
    VALUES ('John', 'Admin', 'admin@brainlabs.com', 'john-admin', 'd9bb30fe-79d1-4997-832c-072cb73c1e74')
    ON CONFLICT (auth_user_id) DO UPDATE SET first_name = EXCLUDED.first_name, second_name = EXCLUDED.second_name;

    -- Researcher
    INSERT INTO member (first_name, second_name, contact_email, slug, auth_user_id)
    VALUES ('Dr. Alice', 'Smith', 'alice.smith@brainlabs.com', 'alice-smith', '1b87068e-07b9-4c9a-965a-cbd3f03eb6d0')
    ON CONFLICT (auth_user_id) DO UPDATE SET first_name = EXCLUDED.first_name, second_name = EXCLUDED.second_name;

    -- Research Assistant
    INSERT INTO member (first_name, second_name, contact_email, slug, auth_user_id)
    VALUES ('Bob', 'Junior', 'bob.junior@brainlabs.com', 'bob-junior', '5605294f-069a-4291-9bb3-5b8edc8c03da')
    ON CONFLICT (auth_user_id) DO UPDATE SET first_name = EXCLUDED.first_name, second_name = EXCLUDED.second_name;

    -- 2. FETCH INTERNAL IDs
    SELECT id INTO admin_id FROM member WHERE auth_user_id = 'd9bb30fe-79d1-4997-832c-072cb73c1e74';
    SELECT id INTO researcher_id FROM member WHERE auth_user_id = '1b87068e-07b9-4c9a-965a-cbd3f03eb6d0';
    SELECT id INTO ra_id FROM member WHERE auth_user_id = '5605294f-069a-4291-9bb3-5b8edc8c03da';

    -- 3. ENSURE ROLE SPECIALIZATIONS EXIST
    -- Admin role
    INSERT INTO admin (member_id) VALUES (admin_id) ON CONFLICT (member_id) DO NOTHING;
    
    -- Researcher role
    INSERT INTO researcher (member_id, country, bio, approval_status, approved_by_admin_id)
    VALUES (researcher_id, 'United Kingdom', 'Lead researcher in neural networks.', 'APPROVED', admin_id)
    ON CONFLICT (member_id) DO NOTHING;

    -- Assistant role (Assigned to Alice)
    INSERT INTO research_assistant (member_id, assigned_by_researcher_id, approval_status, approved_by_admin_id)
    VALUES (ra_id, researcher_id, 'APPROVED', admin_id)
    ON CONFLICT (member_id) DO UPDATE SET assigned_by_researcher_id = EXCLUDED.assigned_by_researcher_id;

    -- 4. CLEANUP EXISTING CONTENT FOR THESE USERS (To avoid massive duplication on re-run)
    DELETE FROM publication WHERE created_by_member_id IN (researcher_id, ra_id);
    DELETE FROM blog WHERE created_by_member_id IN (researcher_id, ra_id);
    DELETE FROM tutorial WHERE created_by_member_id IN (researcher_id, ra_id);
    DELETE FROM project WHERE created_by_member_id IN (researcher_id, ra_id);
    DELETE FROM event WHERE created_by_researcher = researcher_id;
    DELETE FROM grant_info WHERE created_by_researcher = researcher_id;

    -- 5. GENERATE PUBLICATIONS (12 items)
    FOR i IN 1..12 LOOP
        creator_id := CASE WHEN i % 2 = 0 THEN researcher_id ELSE ra_id END;
        status_to_use := CASE 
            WHEN creator_id = ra_id AND i <= 6 THEN 'PENDING_RESEARCHER'::approval_status_enum
            ELSE statuses[(i % 4) + 1]
        END;

        INSERT INTO publication (title, authors, publication_year, created_by_member_id, approval_status, approved_by_admin_id)
        VALUES (
            'Neural Study #' || i || ': Dynamic Mapping',
            'Group ' || i,
            2021 + (i % 4),
            creator_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

    -- 6. GENERATE BLOGS (12 items)
    FOR i IN 1..12 LOOP
        creator_id := CASE WHEN i % 3 = 0 THEN researcher_id ELSE ra_id END;
        status_to_use := CASE 
            WHEN creator_id = ra_id AND i <= 4 THEN 'PENDING_RESEARCHER'::approval_status_enum
            ELSE statuses[(i % 4) + 1]
        END;

        INSERT INTO blog (title, description, content, created_by_member_id, approval_status, approved_by_admin_id)
        VALUES (
            'Insights on Brain Mapping #' || i,
            'Weekly update ' || i,
            'Comprehensive blog content for entry ' || i,
            creator_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

    -- 7. GENERATE PROJECTS (12 items)
    FOR i IN 1..12 LOOP
        creator_id := CASE WHEN i % 2 = 0 THEN ra_id ELSE researcher_id END;
        status_to_use := CASE 
            WHEN creator_id = ra_id AND i <= 6 THEN 'PENDING_RESEARCHER'::approval_status_enum
            ELSE statuses[(i % 4) + 1]
        END;

        INSERT INTO project (title, description, content, created_by_member_id, approval_status, approved_by_admin_id)
        VALUES (
            'Lab Project ' || i,
            'Description for ' || i,
            'Technical detail for ' || i,
            creator_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

    -- 8. GENERATE TUTORIALS (12 items)
    FOR i IN 1..12 LOOP
        creator_id := CASE WHEN i % 2 = 0 THEN ra_id ELSE researcher_id END;
        status_to_use := CASE 
            WHEN creator_id = ra_id AND i <= 6 THEN 'PENDING_RESEARCHER'::approval_status_enum
            ELSE statuses[(i % 4) + 1]
        END;

        INSERT INTO tutorial (title, description, content, created_by_member_id, approval_status, approved_by_admin_id)
        VALUES (
            'Learning Module ' || i,
            'Basics of brain data ' || i,
            'Step by step instructions for ' || i,
            creator_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

    -- 9. GENERATE EVENTS (12 items)
    FOR i IN 1..12 LOOP
        status_to_use := CASE WHEN i % 2 = 0 THEN 'APPROVED'::approval_status_enum ELSE 'PENDING_ADMIN'::approval_status_enum END;
        INSERT INTO event (title, event_type, description, event_datetime, premises, host, created_by_researcher, approval_status, approved_by_admin_id)
        VALUES (
            'BrAIN Event ' || i,
            'Symposium',
            'Summary for event ' || i,
            NOW() + (i || ' days')::interval,
            'Main Lab ' || i,
            'Dr. Alice Smith',
            researcher_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

    -- 10. GENERATE GRANTS (12 items)
    FOR i IN 1..12 LOOP
        status_to_use := CASE WHEN i % 2 = 0 THEN 'APPROVED'::approval_status_enum ELSE 'PENDING_ADMIN'::approval_status_enum END;
        INSERT INTO grant_info (title, description, passed_date, expire_date, created_by_researcher, approval_status, approved_by_admin_id)
        VALUES (
            'Research Grant FY' || (2020+i),
            'Grant detail for ' || i,
            '2024-01-01',
            '2026-01-01',
            researcher_id,
            status_to_use,
            CASE WHEN status_to_use = 'APPROVED' THEN admin_id ELSE NULL END
        );
    END LOOP;

END $$;

COMMIT;
