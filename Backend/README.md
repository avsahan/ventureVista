# Backend

## Local setup

1. From this directory, create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` with the username and password for your local MySQL server. The
   example uses `root` with an empty password; change it if your MySQL account
   uses a password or a different username.
3. Run `sql/schema.sql` in MySQL Workbench to create the `venturevista` database
   and its tables.
   For an existing database, connect MySQL Workbench to the same database used
   by this backend, open `sql/migrations/003-add-guide-profile-photo.sql`, and
   execute it before registering guides with photos. Confirm the
   `guide_profiles` table has `profile_photo_data` and
   `profile_photo_mime_type` columns. The backend `.env` determines which
   database the app uses.
   For an existing trip database, also execute
   `sql/migrations/006-align-trip-planner-columns.sql` in MySQL Workbench,
   connected to the database named by `DB_NAME` in this backend's `.env`.
   `CREATE TABLE IF NOT EXISTS` does not update columns in an existing table,
   so rerunning `schema.sql` alone will not make trip dates optional. The
   migration updates the existing `traveler_trips` columns without removing
   trip data. Restart the backend after it completes.
   To enable trip cancellation for an existing database, also run
   `sql/migrations/007-add-cancelled-trip-status.sql` in the same database.
   It preserves existing trip records and allows cancelled plans to remain
   stored as history.
   Run `sql/migrations/008-add-cancelled-booking-status.sql` as well so
   cancelled guide requests can be recorded and shown in the guide dashboard.
4. Start the backend:

   ```powershell
   npm run dev
   ```

The `.env` file is local-only and is ignored by Git. The backend loads it from
this directory regardless of the directory used to start the server.

For the Render deployment, set `CLIENT_ORIGINS` to
`https://venture-vista-explore.vercel.app` (and any other trusted frontend
origins, comma-separated), then redeploy the backend. The deployed frontend
origin is also included in the backend's built-in allowlist.

For the Vercel frontend, set `VITE_API_URL` to
`https://rpv01-backend-o868.onrender.com` in the project environment variables
for every deployment environment, then redeploy the frontend. The frontend
also redirects the previous `rpv01-backend-1.onrender.com` setting to the
current backend URL.
