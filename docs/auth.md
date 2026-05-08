# Auth Flow

GatorLend uses Supabase Auth for:

- email/password signup
- one-time email confirmation
- returning-user password login
- password reset
- session management

Resend SMTP is configured in the Supabase Dashboard. The app does not send auth emails directly.
Approved tester emails can also be enabled in app code for development without changing the
default school-email requirement for regular users.

## Pilot Access Rules

- Access is limited to verified `@sfsu.edu` email users during the pilot.
- Approved tester accounts can be granted access for development workflows.
- This verifies control of an `@sfsu.edu` email, not official student, faculty, or alumni status.
- GatorLend is an independent student-built pilot and is not endorsed by SFSU or CSU.
- GatorLend does not process payments or hold funds.

## Signup And Confirmation

1. A user signs up with an `@sfsu.edu` email and password.
2. Supabase sends the confirmation email through the configured SMTP provider.
3. The user confirms through `/auth/callback`.
4. The app bootstraps a `profiles` row if one does not already exist.

## Login And Profile Setup

1. Returning users log in with email and password.
2. Unverified users are blocked until the school email is confirmed.
3. After confirmed login, the app checks the `profiles` table.
4. If the profile is missing or the username is missing, the user is sent to `/profile/setup`.
5. A unique username is required before core marketplace actions are allowed.

## Profile Requirements

The `profiles` table stores:

- `id`
- `email`
- `username`
- `display_name`
- `role`
- `wallet_address`
- `major`
- `student_type`
- `bio`
- `created_at`
- `updated_at`

Username rules:

- lowercase only
- 3 to 24 characters
- letters, numbers, and underscores only
- cannot start or end with underscore
- reserved names are rejected

## Marketplace Relationship

- Wallet connection is optional and separate from auth.
- Listings, requests, and transfers use Supabase-authenticated user IDs.
- Username changes do not break ownership records because listings reference `owner_user_id`.
- XRPL minting remains an optional testnet verification layer for selected textbook flows.

## Auth Email Redirect Troubleshooting

- Signup confirmation uses `getAuthCallbackUrl("/profile/setup")`.
- Password reset uses `getAuthCallbackUrl("/auth/reset-password")`.
- `NEXT_PUBLIC_SITE_URL` controls production redirects.
- In production, `NEXT_PUBLIC_SITE_URL` should be `https://fin-gatorlend.com`.
- Local development can use `http://localhost:3000`.
- Supabase Dashboard allowed redirect URLs should include:
  `https://fin-gatorlend.com/**`
  `http://localhost:3000/**`
- Resend may still warn that links use the `supabase.co` auth domain unless Supabase custom domains are configured. That warning is separate from whether the final redirect works.
