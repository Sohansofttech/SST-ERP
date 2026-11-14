# Super Admin setup and provisioning

## Required configuration

Keep the existing values in the local, ignored `.env` file private. The portal uses:

- `DATABASE_URL` for PostgreSQL/Prisma.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the shared Supabase Auth project.
- `NEXT_PUBLIC_SITE_URL` as the public base URL for Supabase password recovery redirects (`http://localhost:3000` in local development).
- `SUPER_ADMIN_DEV_AUTH_BYPASS` is an optional local-development-only authentication bypass. It defaults to `false` in `.env.example` and is honored only when `NODE_ENV=development` and its value is exactly `true`. It is always ignored in production.
- `SUPER_ADMIN_DASHBOARD_DEMO` independently selects illustrative dashboard data in development. It does not grant access or bypass login; with the authentication bypass disabled, a real signed-in Super Admin is still required.

Configure `/admin/auth/callback` as an allowed redirect URL in Supabase Auth. Configure Supabase password sign-in and email delivery before expecting reset emails. SMTP/email delivery has not been verified by this code change.

## Provision the first Super Admin

1. A trusted project administrator creates or invites the person's account in the existing Supabase Auth project and verifies the email address.
2. Obtain that Auth user's UUID from the trusted Supabase dashboard.
3. After the shared initial database migration is reviewed and applied, a trusted database administrator creates the matching `User` profile with the same UUID, the verified email/name, `status = ACTIVE`, and `platformRole = SUPER_ADMIN`.
4. The person signs in at `/admin/login` with the password set through Supabase. The server checks the Supabase session and matching active Prisma role before opening `/admin`.

Do not place passwords, Supabase service-role keys or database credentials in source code, browser storage, or this document. Do not grant the role to an account based only on an email submitted in the UI. There is no service-role key or agreed user-invitation endpoint configured here, so this portal does not create Auth users or grant roles itself.

## Database migration coordination

The feature branch contains an additive migration for the Super Admin data models. The repository's earlier migration status showed `0_init` as pending. Review the shared baseline and this additive migration with the team before applying anything to the shared database; do not run migrations against production from this portal setup process. Existing portals must coordinate on the shared model names and feature entitlement helper before integration.

## Local development and authentication

For normal local authentication, keep `SUPER_ADMIN_DEV_AUTH_BYPASS=false`, run `npm run dev`, and visit `http://localhost:3000/admin/login`. `/admin` requires a real Supabase-authenticated user whose database profile is active and assigned `SUPER_ADMIN`.

For isolated local UI development only, set `SUPER_ADMIN_DEV_AUTH_BYPASS=true` before starting `npm run dev`. This skips Super Admin authentication for local development requests; do not expose that development server to untrusted users. The setting cannot enable bypass in production, even if configured there.

To preview the illustrative dashboard independently, set `SUPER_ADMIN_DASHBOARD_DEMO=true` in development. This changes dashboard data only and does not change authentication requirements. No test credential is included.
