# Profile Data

`profile_data.json` stores the content used by the site to populate information about Tanawitch Saentree. The file is consumed at build time and by the chatbot to answer questions about the profile.

## Structure

The JSON document has the following top-level fields:

- `full_name` – Object containing the primary name and optional extra notes.
- `current_role` – Current job title.
- `career_outlook` – Short description of desired career direction.
- `work_experience` – Array of work history entries. Each entry requires:
  - `company`
  - `role`
  - `start_date`
  - `end_date`
  - `description`
  - `link`
  Optional fields include `summary` and `achievements` (an array of strings).
- `competencies` – Array of skill objects containing `name` and `description`.
- `intents` – Object where each key represents an intent. Each intent contains:
  - `keywords` – Array of trigger words.
  - `response` – Array of canned responses.

See [`profile_data.schema.json`](../profile_data.schema.json) for the complete schema.

## Usage

1. Modify `profile_data.json` to add or update profile content.
2. Run the validation script to ensure the file matches the schema:

```bash
npm run validate-profile-data
```

The script validates the JSON structure and types, preventing missing fields or invalid values from being committed.

