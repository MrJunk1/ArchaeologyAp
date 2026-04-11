# Supabase Storage Configuration

To enable image uploads in the "Add Artifact" screen, you need to create a storage bucket in your Supabase project.

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. In the left sidebar, click on **Storage**.
3. Click **New Bucket**.
4. Name the bucket exactly: `artifact-media`
5. **Important:** Check the box for "Public bucket". This allows images to be viewed without authentication tokens, which is required for the app's current implementation to display the images.
6. Click **Save**.

### Storage Policies (Optional but Recommended)

For better security, you should configure Policies for the `artifact-media` bucket.

1. Go to **Storage** -> **Policies**.
2. Under "Policies under artifact-media", click **New Policy**.
3. Select "For Full Customization".
4. Create a policy for **INSERT** operations:
   - **Policy Name:** Allow authenticated uploads
   - **Allowed operation:** INSERT
   - **Target roles:** authenticated
   - **Policy definition:** `(bucket_id = 'artifact-media'::text)`
5. Click **Review** and then **Save policy**.

*(Since it's a public bucket, SELECT operations are generally allowed by default for public viewing, but you can explicitly add a SELECT policy for `public` if needed.)*
