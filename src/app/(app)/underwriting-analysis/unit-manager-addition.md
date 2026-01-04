Implement a unit manager selection feature in the facultative offer submission form. When an underwriter submits a new offer for approval, they must select which unit manager will review it.

API Endpoints

1. Get Unit Managers List

GET /api/underwriting/facultative/unit-managers

Response:
[
{
"username": "jdoe",
"displayName": "jdoe"
},
{
"username": "msmith",
"displayName": "msmith"
}
]

Note: displayName and username have the same value since the user table doesn't have a separate display name field.

Purpose: Fetch list of available unit managers to populate dropdown/select field.

Error Handling:
- Returns empty array [] if no unit managers found
- Returns HTTP 500 on server error

2. Submit Offer (Updated)

POST /api/underwriting/facultative/submit

Request Body (Updated - New Field Added):
{
"cedant": "ABC Insurance",
"insured": "XYZ Corporation",
"broker": "Broker Name",
"occupation": "Manufacturing",
"country": "Tanzania",
"currency": "USD",
"exchangeRate": 0.01710,
"periodFrom": "2025-01-01",
"periodTo": "2025-12-31",
"offerReceivedDate": "2025-01-15",
"sumInsuredOs": 5000000.00,
"premiumOs": 50000.00,
"shareOfferedPct": 0.50,
"shareAcceptedPct": 0.60,
"retroTypeId": 1,
"retroYear": 2025,
"unitManagerUsername": "jdoe",  // ← NEW REQUIRED FIELD
"notes": "Optional notes here"
}

Response (Success):
{
"offerId": 123,
"analysisId": 456,
"processInstanceId": "abc-123-def-456",
"businessKey": "FAC_OFFER_123",
"status": "SUBMITTED",
"message": "Facultative offer submitted for approval successfully"
}

Response (Error - Missing Unit Manager):
{
"status": "ERROR",
"message": "Submission failed: Unit manager must be selected"
}

UI Requirements

1. Add Unit Manager Selection Field

Location: In the facultative offer submission form, add the unit manager selector before the submit button.

Field Specifications:
- Label: "Unit Manager" or "Assign to Unit Manager"
- Type: Dropdown/Select field (required)
- Placeholder: "Select unit manager..."
- Display: Show username only
- Validation: Required field - must be selected before submission

Example HTML/JSX Structure:
  <div class="form-group">
    <label for="unitManager">Unit Manager <span class="required">*</span></label>
    <select
      id="unitManager"
      name="unitManagerUsername"
      required
      class="form-control"
    >
      <option value="">Select unit manager...</option>
      <!-- Options populated from API - display username -->
    </select>
    <small class="form-text text-muted">
      Select the unit manager who will review this offer
    </small>
  </div>

2. Data Loading Flow

On Form Load:
1. Call GET /api/underwriting/facultative/unit-managers
2. Populate the unit manager dropdown with usernames from response
3. If API returns empty array, show warning message: "No unit managers available. Please contact administrator."
4. Disable submit button if no unit managers available

On Form Submit:
1. Validate that unitManagerUsername is selected (not empty)
2. Include unitManagerUsername in the request body
3. Submit to POST /api/underwriting/facultative/submit
4. Handle success/error responses

Implementation Steps

Step 1: Add State Management

// React example
const [unitManagers, setUnitManagers] = useState([]);
const [selectedUnitManager, setSelectedUnitManager] = useState('');
const [loadingManagers, setLoadingManagers] = useState(true);

// Vue example
data() {
return {
unitManagers: [],
selectedUnitManager: '',
loadingManagers: true
}
}

Step 2: Fetch Unit Managers on Component Mount

// React useEffect example
useEffect(() => {
fetchUnitManagers();
}, []);

async function fetchUnitManagers() {
try {
setLoadingManagers(true);
const response = await fetch('/api/underwriting/facultative/unit-managers', {
headers: {
'Authorization': `Bearer ${authToken}` // Include auth token
}
});

      if (!response.ok) {
        throw new Error('Failed to fetch unit managers');
      }

      const data = await response.json();
      setUnitManagers(data);

      if (data.length === 0) {
        // Show warning - no unit managers available
        showWarning('No unit managers available. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error fetching unit managers:', error);
      showError('Failed to load unit managers. Please refresh the page.');
    } finally {
      setLoadingManagers(false);
    }
}

Step 3: Render Unit Manager Selector

// React example
  <div className="form-group">
    <label htmlFor="unitManager">
      Unit Manager <span className="text-danger">*</span>
    </label>

    {loadingManagers ? (
      <div>Loading unit managers...</div>
    ) : (
      <select
        id="unitManager"
        name="unitManagerUsername"
        value={selectedUnitManager}
        onChange={(e) => setSelectedUnitManager(e.target.value)}
        required
        className="form-control"
        disabled={unitManagers.length === 0}
      >
        <option value="">Select unit manager...</option>
        {unitManagers.map((manager) => (
          <option key={manager.username} value={manager.username}>
            {manager.username}
          </option>
        ))}
      </select>
    )}

    <small className="form-text text-muted">
      Select the unit manager who will review this offer
    </small>
  </div>

Step 4: Update Form Submission

async function handleSubmit(event) {
event.preventDefault();

    // Validate unit manager is selected
    if (!selectedUnitManager) {
      showError('Please select a unit manager');
      return;
    }

    const formData = {
      cedant: formState.cedant,
      insured: formState.insured,
      broker: formState.broker,
      occupation: formState.occupation,
      country: formState.country,
      currency: formState.currency,
      exchangeRate: formState.exchangeRate,
      periodFrom: formState.periodFrom,
      periodTo: formState.periodTo,
      offerReceivedDate: formState.offerReceivedDate,
      sumInsuredOs: formState.sumInsuredOs,
      premiumOs: formState.premiumOs,
      shareOfferedPct: formState.shareOfferedPct,
      shareAcceptedPct: formState.shareAcceptedPct,
      retroTypeId: formState.retroTypeId,
      retroYear: formState.retroYear,
      unitManagerUsername: selectedUnitManager, // ← NEW FIELD
      notes: formState.notes
    };

    try {
      setSubmitting(true);

      const response = await fetch('/api/underwriting/facultative/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      // Success
      showSuccess(`Offer submitted successfully to ${selectedUnitManager}! Offer ID: ${result.offerId}`);

      // Optional: Navigate to offer details or overview page
      navigate(`/underwriting/offers/${result.offerId}`);

    } catch (error) {
      console.error('Submission error:', error);
      showError(error.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
}

Validation Rules

1. Unit Manager Selection:
   - Required field
   - Must be a valid username from the fetched list
   - Show error if not selected on submit
2. Submit Button:
   - Disable if unit managers list is empty
   - Disable while submitting (prevent double-submit)
   - Show loading spinner during submission

Error Handling

Scenario 1: No Unit Managers Found
if (unitManagers.length === 0) {
return (
<div className="alert alert-warning">
<strong>No unit managers available.</strong>
<p>Please contact the administrator to assign unit managers.</p>
</div>
);
}

Scenario 2: API Error on Load
showError('Failed to load unit managers. Please refresh the page or contact support.');

Scenario 3: Submission Error
// Display the error message from API response
if (result.message.includes('Unit manager must be selected')) {
showError('Please select a unit manager before submitting');
} else {
showError(result.message);
}
