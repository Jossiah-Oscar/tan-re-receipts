Required Features

1. Full CRUD Operations for 4 entities with tables, forms, validation
2. Search & Filtering: Global search, entity-specific filters, sortable columns
3. Bulk Import/Export: Excel upload/download with templates and validation

Entities to Manage

1. Business Type

API Endpoints:
- GET /business-types - List all
- POST /business-types - Create
- PUT /business-types/{id} - Update
- DELETE /business-types/{id} - Delete

Fields:
- id (Long, auto)
- name (String, required)
- description (String, optional)
- createdAt, updatedAt (auto)

Request Body (Create/Update):
{
"name": "New Business",
"description": "Optional description"
}

2. Line of Business

API Endpoints:
- GET /line-of-business - List all
- POST /line-of-business - Create
- PUT /line-of-business/{id} - Update
- DELETE /line-of-business/{id} - Delete

Fields:
- id (Long, auto)
- name (String, required)
- createdAt, updatedAt (auto)

Request Body:
{
"name": "Property"
}

3. Retro Type

API Endpoints:
- GET /retro-types - List all (includes nested LOB and Business Type)
- POST /retro-types - Create
- PUT /retro-types/{id} - Update
- DELETE /retro-types/{id} - Delete

Fields:
- id (Long, auto)
- name (String, required)
- description (String, optional)
- lobId (Long, required, FK → Line of Business)
- businessTypeId (Long, required, FK → Business Type)
- lineOfBusiness (object in response)
- businessType (object in response)
- createdAt, updatedAt (auto)

Request Body:
{
"name": "Property Quota Share",
"description": "Optional",
"lobId": 1,
"businessTypeId": 1
}

Response includes nested objects:
{
"id": 1,
"name": "Property QS",
"lobId": 1,
"lobName": "Property",
"businessTypeId": 1,
"businessTypeName": "New Business"
}

4. Retro Capacity (General Surplus)

API Endpoints:
- GET /capacities - List all
- GET /capacities/retro-type/{retroTypeId} - Filter by retro type
- GET /capacities/year/{year} - Filter by year
- POST /capacities - Create
- PUT /capacities/{id} - Update
- DELETE /capacities/{id} - Delete

Fields:
- retroCapacityId (Long, auto)
- retroTypeId (Long, required, FK → Retro Type)
- retroType (object in response)
- year (Short, required, 2000-2100)
- currency (String, required, exactly 3 chars, e.g., "USD")
- retention (BigDecimal, required, ≥0)
- lines (Integer, required, ≥0)
- treatyLimit (BigDecimal, computed, read-only)
- total (BigDecimal, computed, read-only)
- rmsId (String, optional, max 32 chars)
- note (String, optional)
- createdAt, updatedAt (auto)

Unique Constraint: (retroTypeId, year, currency) must be unique

Request Body:
{
"retroTypeId": 1,
"year": 2025,
"currency": "USD",
"retention": 1000000.00,
"lines": 10,
"rmsId": "RMS-001",
"note": "Optional note"
}

Error Response (409 duplicate):
{
"error": "Capacity already exists for this retro type, year, and currency"
}

Relationships

- RetroType → LineOfBusiness (Many-to-One)
- RetroType → BusinessType (Many-to-One)
- Capacity → RetroType (Many-to-One)
