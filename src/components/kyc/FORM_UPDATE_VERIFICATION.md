# StudentKYCForm Update Capability - Verification

## Implementation Summary

The StudentKYCForm component now supports both creating new submissions and updating existing ones.

## Key Features Implemented

### 1. Edit Mode Detection
- Component accepts `existingSubmission` prop
- Automatically detects edit mode: `const isEditMode = !!existingSubmission`
- Updates UI elements (button text) based on mode

### 2. Data Loading
- `useEffect` hook loads existing submission data when `existingSubmission` prop is provided
- Populates all form fields with existing values
- Converts numeric fields (admission_year, expected_graduation_year) to strings for form inputs

### 3. Status Validation
- Checks verification_status before allowing edits
- Only allows editing when status is "pending" or "requires_update"
- Shows error toast if user tries to edit a submission with other statuses
- Validation occurs in both useEffect and handleSubmit

### 4. Document URL Preservation
- When updating, preserves existing document URLs if no new file is uploaded
- Only replaces document URLs when new files are selected
- Applies to all document types:
  - id_document_url
  - student_id_card_url
  - admission_letter_url
  - school_id_card_url
  - current_semester_receipt_url

### 5. Update vs Insert Logic
- `handleSubmit` checks `isEditMode` to determine operation
- **UPDATE mode**: Uses `.update()` with `.eq('id', existingSubmission.id)`
- **INSERT mode**: Uses `.insert()` with new record
- Resets verification_status to "pending" on resubmission
- Updates updated_at timestamp automatically

### 6. User Experience
- Submit button text changes: "Submit KYC" → "Update KYC"
- Loading state text changes: "Submitting..." → "Updating..."
- Success message indicates update vs new submission
- Form state only resets after new submissions (not updates)

## Usage Example

```tsx
// For new submission
<StudentKYCForm onSubmitSuccess={() => navigate('/dashboard')} />

// For updating existing submission
<StudentKYCForm 
  existingSubmission={kycData}
  onSubmitSuccess={() => navigate('/dashboard')} 
/>
```

## Status Flow

1. User submits new KYC → status = "pending"
2. Admin marks as "requires_update" → user can edit
3. User updates and resubmits → status reset to "pending"
4. Admin verifies → status = "verified" (no longer editable)
5. Admin rejects → status = "rejected" (no longer editable)

## Error Handling

- Validates status before allowing edits
- Shows clear error messages for invalid edit attempts
- Preserves form data on upload errors
- Handles duplicate submission errors
- Provides specific error messages for different failure scenarios
