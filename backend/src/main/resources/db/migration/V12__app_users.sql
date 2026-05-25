-- V12: app_users table for admin user management

CREATE TABLE IF NOT EXISTS app_users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    role       TEXT        NOT NULL DEFAULT 'viewer',
    active     BOOLEAN     NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role  ON app_users(role);

INSERT INTO app_users (name, email, role, active) VALUES
      ('Dr. Sarah Garcia',   'sgarcia@hospital.org',    'provider', true),
      ('Admin User',          'admin@hospital.org',       'admin',    true),
      ('Dr. Raj Patel',       'rpatel@hospital.org',      'provider', true),
      ('Nurse Kelly',         'nkelly@hospital.org',      'nurse',    false),
      ('Dr. Linda Chen',      'lchen@hospital.org',       'provider', true),
      ('Dr. Marcus Williams', 'mwilliams@hospital.org',   'provider', true),
      ('Ana Rodriguez',       'arodriguez@hospital.org',  'nurse',    true),
      ('Data Viewer',         'viewer@hospital.org',      'viewer',   false)
ON CONFLICT (email) DO NOTHING;
