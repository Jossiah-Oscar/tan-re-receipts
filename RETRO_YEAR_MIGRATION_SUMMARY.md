# Retro Year Migration Summary

## Problem
The application was trying to insert `retroYear` as a simple year value (e.g., 2025), but the database had a foreign key constraint expecting it to reference the `retro_year` table.

## Solution
We've removed the dependency on the `retro_year` table and changed `retro_year_id` to a simple `retro_year` field that stores the year directly.

---

## Changes Made

### 1. Frontend Changes

#### `src/store/useOfferAnalysisStore.ts`
- ✅ Added `retroYear: number` field to `OfferFormData` interface
- ✅ Initialized default value to current year
- ✅ Updated `calculateValues()` to use `s.retroYear` instead of deriving from `periodFrom`
- ✅ Updated `submitForm()` to use `v.retroYear` directly
- ✅ Updated `resetForm()` to reset `retroYear` to current year

#### `src/app/(app)/underwriting-analysis/page.tsx`
- ✅ Added "Retro Year" NumberInput field in the form
- ✅ Reorganized grid layout (LOB, Retro Year, Retro Type as 4-column fields)
- ✅ Made the field required with validation

---

### 2. Backend Changes

#### Database Migration: `006-change-retro-year-to-simple-field.yaml`
Created a new Liquibase migration that:
1. Drops the foreign key constraint `fk_fac_offer_retro_year`
2. Drops the index `ix_fac_offer_program_year`
3. Renames column from `retro_year_id` to `retro_year`
4. Changes data type to `SMALLINT`
5. Adds check constraint for valid year range (2000-2100)
6. Recreates the index with the new column name

#### `db.changelog-master.yaml`
- ✅ Added reference to the new migration file

#### `models/FacultativeOffer.java`
- ✅ Changed field from `Long retroYearId` to `Short retroYear`
- ✅ Updated column name from `retro_year_id` to `retro_year`
- ✅ Updated comment to reflect it's now a simple year field

#### `FacultativeAnalysisService.java`
- ✅ Updated line 264 to use `offer.setRetroYear()` instead of `offer.setRetroYearId()`
- ✅ Changed from `longValue()` to `shortValue()` for proper type conversion

---

## How to Apply These Changes

### Important: Migration Updated to Handle Existing Data
The migration now includes a step to fix any existing invalid year values before adding the constraint.

### Step 1: Restart the Backend
The Liquibase migration will run automatically when you restart your Spring Boot application:

```bash
cd C:\Dev\java\document-register
./mvnw spring-boot:run
```

**Note**: If Liquibase already tried to run the old version of the migration and failed, you may need to:
1. Delete the failed changeset from `databasechangelog` table:
   ```sql
   DELETE FROM databasechangelog
   WHERE id = '206-drop-retro-year-fk-and-change-to-simple-year';
   ```
2. Then restart the application

### Step 2: Verify the Migration
Check the console output for Liquibase migration logs. You should see:
```
Running Changeset: db/changelog/changes/006-change-retro-year-to-simple-field.yaml::206-drop-retro-year-fk-and-change-to-simple-year::tanre
```

### Step 3: Test the Frontend
1. Start your frontend application
2. Navigate to the Underwriting Analysis page
3. Fill out the form including the new "Retro Year" field
4. Click "Calculate" - should work without errors
5. Click "Submit Analysis" - should save successfully

---

## What Was Fixed

### Before:
- Database expected `retro_year_id` (BIGINT) as a foreign key to `retro_year.retro_year_id`
- Frontend sent `retroYear: 2025` (Integer)
- **Error**: `Key (retro_year_id)=(2025) is not present in table "retro_year"`

### After:
- Database now has `retro_year` (SMALLINT) as a simple year field
- Frontend sends `retroYear: 2025` (Integer)
- Backend converts to `Short` and stores directly
- **Success**: No foreign key constraint, year stored as-is

---

## Database Schema Change

### Old Schema:
```sql
retro_year_id BIGINT NOT NULL REFERENCES retro_year(retro_year_id)
```

### New Schema:
```sql
retro_year SMALLINT NOT NULL CHECK (retro_year BETWEEN 2000 AND 2100)
```

---

## Future Enhancement Options

If you want to filter Retro Types by year in the future, you can:

1. Update `RetroType` entity to include a `year` field
2. Modify the `getRetroTypeSelectData()` method to accept both `lobId` and `year`
3. Update the UI to filter retro types when the year changes

For now, retro types are only filtered by Line of Business, and the year is stored separately for each offer.

---

## Rollback Instructions (if needed)

If you need to rollback this change:

1. Stop the application
2. Manually revert the Liquibase changeset in the database
3. Revert the code changes in Git
4. Restart the application

However, this should not be necessary as the migration is designed to be safe and reversible.
