# Design Document: Student KYC Completion

## Overview

The Student KYC Completion feature extends the existing Campus Comfort platform to provide a complete identity verification workflow for Nigerian students. The system consists of three main components:

1. **Student-facing KYC Form**: A multi-step React form component that collects personal information, student credentials, documents, and guardian details
2. **Document Storage System**: Supabase storage integration for secure document uploads with row-level security
3. **Admin Review Dashboard**: An administrative interface for reviewing, approving, and rejecting KYC submissions

The design builds upon the existing `student_kyc` database table and partially implemented `StudentKYCForm.tsx` component. The system enforces security through Supabase RLS policies and provides automatic risk scoring to help administrators prioritize reviews.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Student User Interface                   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard KYC Card  │  KYC Form (4 tabs)  │  Status View   │
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  student_kyc table  │  kyc-documents bucket  │  RLS Policies│
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Admin User Interface                       │
├─────────────────────────────────────────────────────────────┤
│  KYC List View  │  Detail View  │  Approve/Reject Actions   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

**Student Components:**
- `UserDashboard` (existing) → Add KYC status card
- `StudentKYCForm` (partial) → Complete all 4 tabs
- `KYCStatusDisplay` (new) → Show verification status

**Admin Components:**
- `AdminStudentKYC` (new) → Main review interface
- `KYCSubmissionList` (new) → Table of submissions
- `KYCSubmissionDetail` (new) → Detailed view with actions
- `DocumentViewer` (new) → Display uploaded documents

### Data Flow

1. **Submission Flow:**
   - Student fills form → Uploads documents to storage → Creates student_kyc record → Risk score calculated automatically → Admin notified

2. **Review Flow:**
   - Admin views list → Filters by status → Opens detail view → Reviews documents → Approves/Rejects → Student notified

3. **Update Flow:**
   - Student sees "requires_update" status → Opens form with existing data → Updates fields → Resubmits → Status reset to "pending"

## Components and Interfaces

### 1. StudentKYCForm Component

**Location:** `src/components/kyc/StudentKYCForm.tsx` (extend existing)

**Props:**
```typescript
interface StudentKYCFormProps {
  existingSubmission?: StudentKYCData | null;
  onSubmitSuccess?: () => void;
}
```

**State Management:**
```typescript
interface FormState {
  currentTab: 'personal' | 'student' | 'documents' | 'guardian';
  formData: StudentKYCFormData;
  documents: DocumentFiles;
  loading: boolean;
  uploadProgress: Record<string, number>;
  errors: Record<string, string>;
}

interface StudentKYCFormData {
  // Personal Info
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  email: string;
  current_address: string;
  state_of_origin: string;
  lga_of_origin: string;
  id_type: string;
  id_number: string;
  
  // Student Info
  student_status: string;
  institution_name: string;
  institution_state: string;
  student_id_number: string;
  matriculation_number: string;
  admission_year: string;
  expected_graduation_year: string;
  course_of_study: string;
  level_of_study: string;
  
  // Guardian Info
  guardian_name: string;
  guardian_phone: string;
  guardian_relationship: string;
  guardian_address: string;
}

interface DocumentFiles {
  id_document: File | null;
  student_id_card: File | null;
  admission_letter: File | null;
  school_id_card: File | null;
  current_semester_receipt: File | null;
}
```

**Tab Structure:**

1. **Personal Information Tab** (already implemented)
   - Full name, DOB, gender, phone, email
   - Current address
   - State of origin, LGA
   - ID type and number

2. **Student Information Tab** (to implement)
   - Student status (current/prospective/graduate)
   - Institution name and state
   - Student ID and matriculation number
   - Admission year, expected graduation
   - Course of study, level

3. **Documents Tab** (to implement)
   - File upload inputs for each document type
   - Preview thumbnails
   - Upload progress indicators
   - File size and type validation

4. **Guardian Information Tab** (to implement)
   - Guardian name, phone, relationship
   - Guardian address
   - Optional but recommended fields

**Key Methods:**
- `handleInputChange(field: string, value: string)`: Update form field
- `handleFileChange(field: string, file: File | null)`: Handle file selection
- `validateTab(tab: string): boolean`: Validate current tab before progression
- `uploadDocument(file: File, path: string): Promise<string>`: Upload to storage
- `handleSubmit()`: Submit complete form
- `loadExistingSubmission()`: Populate form for updates

### 2. KYCStatusDisplay Component

**Location:** `src/components/kyc/KYCStatusDisplay.tsx` (new)

**Props:**
```typescript
interface KYCStatusDisplayProps {
  submission: StudentKYCData | null;
  onStartKYC: () => void;
  onUpdateKYC: () => void;
}
```

**Display Logic:**
- No submission: Show "Start Verification" CTA
- Pending: Show "Under Review" with submission date
- Under Review: Show "Being Reviewed" status
- Verified: Show success badge with verification date
- Rejected: Show rejection reason with "Update" button
- Requires Update: Show admin notes with "Update" button

### 3. AdminStudentKYC Component

**Location:** `src/pages/admin/AdminStudentKYC.tsx` (new)

**State:**
```typescript
interface AdminKYCState {
  submissions: KYCSubmissionSummary[];
  selectedSubmission: StudentKYCData | null;
  filterStatus: VerificationStatus | 'all';
  loading: boolean;
  searchQuery: string;
}

interface KYCSubmissionSummary {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  student_status: string;
  institution_name: string;
  verification_status: VerificationStatus;
  verification_level: string;
  risk_score: number;
  submitted_at: string;
  verified_at: string | null;
  avatar_url: string | null;
  documents_count: number;
}
```

**Layout:**
- Left panel: Filterable list of submissions
- Right panel: Detailed view of selected submission
- Filter bar: Status dropdown, search input
- Action buttons: Approve, Reject, Request Update

### 4. KYCSubmissionDetail Component

**Location:** `src/components/kyc/KYCSubmissionDetail.tsx` (new)

**Props:**
```typescript
interface KYCSubmissionDetailProps {
  submission: StudentKYCData;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onRequestUpdate: (notes: string) => Promise<void>;
}
```

**Sections:**
- Personal Information (read-only display)
- Student Information (read-only display)
- Guardian Information (read-only display)
- Documents (clickable links with preview)
- Risk Assessment (score and flags)
- Admin Actions (approve/reject/request update)
- Review History (previous reviews if any)

### 5. DocumentViewer Component

**Location:** `src/components/kyc/DocumentViewer.tsx` (new)

**Props:**
```typescript
interface DocumentViewerProps {
  documentUrl: string;
  documentType: string;
  onClose: () => void;
}
```

**Features:**
- Modal or new tab display
- Image preview for JPEG/PNG
- PDF viewer for PDF files
- Download button
- Close/back button

## Data Models

### StudentKYCData Type

```typescript
interface StudentKYCData {
  id: string;
  user_id: string;
  
  // Personal Information
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone_number: string;
  email: string;
  current_address: string;
  state_of_origin: string;
  lga_of_origin: string;
  
  // Student Information
  student_status: 'current_student' | 'prospective_student' | 'recent_graduate';
  institution_name: string;
  institution_state: string;
  student_id_number: string | null;
  matriculation_number: string | null;
  admission_year: number | null;
  expected_graduation_year: number | null;
  course_of_study: string | null;
  level_of_study: '100' | '200' | '300' | '400' | '500' | '600' | 'postgraduate' | 'diploma' | null;
  
  // Identification
  id_type: 'nin' | 'voters_card' | 'drivers_license' | 'international_passport' | 'student_id';
  id_number: string;
  id_document_url: string | null;
  
  // Student Documents
  student_id_card_url: string | null;
  admission_letter_url: string | null;
  school_id_card_url: string | null;
  current_semester_receipt_url: string | null;
  
  // Guardian Information
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_relationship: string | null;
  guardian_address: string | null;
  
  // Verification
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_update';
  verification_level: 'basic' | 'standard' | 'premium';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  
  // Risk Assessment
  risk_score: number;
  risk_flags: string[] | null;
  
  // Timestamps
  submitted_at: string;
  updated_at: string;
  verified_at: string | null;
  
  // Metadata
  ip_address: string | null;
  user_agent: string | null;
  submission_source: string;
}
```

### Validation Rules

**Personal Information:**
- `full_name`: Required, 2-200 characters
- `date_of_birth`: Required, must be between 16-100 years ago
- `gender`: Required, one of enum values
- `phone_number`: Required, Nigerian format (+234XXXXXXXXXX)
- `email`: Required, valid email format
- `current_address`: Required, minimum 10 characters
- `state_of_origin`: Required, must be Nigerian state
- `lga_of_origin`: Required, minimum 2 characters
- `id_type`: Required, one of enum values
- `id_number`: Required, minimum 5 characters

**Student Information:**
- `student_status`: Required
- `institution_name`: Required, minimum 3 characters
- `institution_state`: Required, must be Nigerian state
- `student_id_number`: Optional, but recommended
- `matriculation_number`: Optional
- `admission_year`: Optional, must be between 1960 and current year + 1
- `expected_graduation_year`: Optional, must be after admission_year
- `course_of_study`: Optional
- `level_of_study`: Optional, one of enum values

**Documents:**
- File types: JPEG, PNG, PDF only
- Maximum file size: 5MB per file
- At least ID document is required
- Student ID card recommended for current students

**Guardian Information:**
- All fields optional but recommended
- If provided, phone must be valid Nigerian format

## Storage Configuration

### Bucket Setup

**Bucket Name:** `kyc-documents`

**Configuration:**
```typescript
{
  public: false,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]
}
```

**RLS Policies:**

1. **User Upload Policy:**
```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

2. **User Read Policy:**
```sql
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

3. **Admin Read Policy:**
```sql
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### File Naming Convention

Format: `{user_id}/{document_type}_{timestamp}.{extension}`

Example: `550e8400-e29b-41d4-a716-446655440000/id_document_1704067200000.pdf`

## Error Handling

### Client-Side Errors

**Form Validation Errors:**
- Display inline error messages below invalid fields
- Prevent tab progression until current tab is valid
- Show error summary at top of form if submission fails

**File Upload Errors:**
- File too large: "File size must be under 5MB"
- Invalid file type: "Please upload JPEG, PNG, or PDF files only"
- Upload failed: "Upload failed. Please try again."
- Network error: "Connection lost. Please check your internet."

**Submission Errors:**
- Duplicate submission: "You have already submitted KYC. Please update your existing submission."
- Database error: "Failed to save. Please try again later."
- Authentication error: "Session expired. Please log in again."

### Server-Side Errors

**Database Errors:**
- Unique constraint violation (user_id): Return 409 Conflict
- Foreign key violation: Return 400 Bad Request
- RLS policy violation: Return 403 Forbidden

**Storage Errors:**
- Bucket not found: Create bucket automatically or return 500
- Upload quota exceeded: Return 507 Insufficient Storage
- Invalid file: Return 400 Bad Request

### Error Recovery

**Automatic Retry:**
- File uploads: Retry up to 3 times with exponential backoff
- Database operations: Retry once after 1 second

**User Actions:**
- Show "Retry" button for failed uploads
- Allow form resubmission after fixing errors
- Preserve form data in local state during errors

## Testing Strategy

### Unit Tests

Unit tests verify specific examples, edge cases, and error conditions. They complement property-based tests by focusing on concrete scenarios.

**Form Validation Tests:**
- Test valid personal information submission
- Test invalid phone number format rejection
- Test date of birth age validation (under 16, over 100)
- Test required field validation
- Test file size limit enforcement (5MB)
- Test file type validation (JPEG, PNG, PDF only)

**Document Upload Tests:**
- Test successful single document upload
- Test upload failure handling
- Test file naming convention
- Test URL generation

**Admin Action Tests:**
- Test approval updates status to "verified"
- Test rejection requires reason
- Test "requires_update" requires admin notes
- Test reviewed_by and reviewed_at are set

**Status Display Tests:**
- Test "no submission" shows CTA button
- Test "verified" shows success badge
- Test "rejected" shows rejection reason
- Test "requires_update" enables edit mode

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs. Each test runs a minimum of 100 iterations with randomized data.

**Configuration:**
- Library: fast-check (for TypeScript/JavaScript)
- Minimum iterations: 100 per property
- Each test references its design document property number



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Form Tab Validation Prevents Invalid Progression

*For any* form data in the Personal Information tab, progression to the next tab should only be allowed when all required fields (full_name, date_of_birth, gender, phone_number, email, current_address, state_of_origin, lga_of_origin, id_type, id_number) contain valid values.

**Validates: Requirements 1.2**

### Property 2: New Submissions Always Start as Pending

*For any* valid KYC form submission, the created KYC_Submission record should have verification_status set to "pending".

**Validates: Requirements 1.6**

### Property 3: File Type Validation Accepts Only Valid Formats

*For any* file selected for document upload, the system should accept the file if and only if its type is JPEG, PNG, or PDF.

**Validates: Requirements 2.1, 11.5**

### Property 4: Document Upload Path Format Consistency

*For any* successfully uploaded document, the storage path should match the format "{user_id}/{document_type}_{timestamp}.{extension}" where user_id is the authenticated user's ID, document_type identifies the document category, timestamp is a valid Unix timestamp, and extension matches the file type.

**Validates: Requirements 2.2**

### Property 5: Document URL Storage After Upload

*For any* successful document upload, the public URL should be stored in the corresponding field of the KYC_Submission record (id_document_url, student_id_card_url, admission_letter_url, school_id_card_url, or current_semester_receipt_url).

**Validates: Requirements 2.3**

### Property 6: Upload Failure Provides Retry Capability

*For any* failed document upload, the system should display an error message and maintain the ability for the user to retry the upload.

**Validates: Requirements 2.4**

### Property 7: Upload Completion Shows Visual Confirmation

*For any* set of document uploads, after all uploads complete, the UI should display visual indicators showing which documents have been successfully uploaded.

**Validates: Requirements 2.5**

### Property 8: Status Display Reflects Current Verification State

*For any* KYC_Submission, the dashboard should display UI elements corresponding to the current verification_status: no submission shows CTA button, pending shows "Under Review", verified shows success badge with date, rejected shows rejection_reason, and requires_update shows admin_notes with edit capability.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 9.2, 9.4, 9.5**

### Property 9: Edit Permission Based on Status

*For any* KYC_Submission, the system should allow editing if and only if the verification_status is "pending" or "requires_update".

**Validates: Requirements 4.1, 4.4**

### Property 10: Document URL Preservation During Updates

*For any* KYC_Submission update, existing document URLs should be preserved if no new document is uploaded for that document type, and should be replaced if a new document is uploaded.

**Validates: Requirements 4.2**

### Property 11: Resubmission Resets Status and Updates Timestamp

*For any* KYC_Submission resubmission, the verification_status should be reset to "pending" and the updated_at timestamp should be set to the current time.

**Validates: Requirements 4.3**

### Property 12: Admin Filter Shows Only Matching Submissions

*For any* verification_status filter selection, the admin interface should display only KYC_Submissions where the verification_status matches the selected filter value.

**Validates: Requirements 5.2**

### Property 13: Document Links Present for All Uploaded Documents

*For any* KYC_Submission with uploaded documents, the admin detail view should display clickable links for each document that has a non-null URL.

**Validates: Requirements 5.4**

### Property 14: Approval Updates All Required Fields

*For any* KYC_Submission approval action, the system should update verification_status to "verified", set verified_at to the current timestamp, and set reviewed_by to the admin user's ID.

**Validates: Requirements 6.1**

### Property 15: Rejection Requires Reason and Updates Fields

*For any* KYC_Submission rejection action, the system should require a non-empty rejection_reason, update verification_status to "rejected", and set reviewed_by to the admin user's ID.

**Validates: Requirements 6.2**

### Property 16: Requires Update Action Mandates Admin Notes

*For any* action marking a KYC_Submission as "requires_update", the system should require non-empty admin_notes explaining what needs to be updated.

**Validates: Requirements 6.3**

### Property 17: Review Notes Storage Updates Timestamp

*For any* admin review notes save action, the system should store the notes in the admin_notes field and update the reviewed_at timestamp to the current time.

**Validates: Requirements 6.4**

### Property 18: Status Changes Trigger Notifications

*For any* change to a KYC_Submission's verification_status, the system should send a notification to the student user associated with that submission.

**Validates: Requirements 6.5**

### Property 19: Risk Score Calculation on Submission Changes

*For any* KYC_Submission creation or update, the system should calculate the risk_score using the calculate_kyc_risk_score database function.

**Validates: Requirements 7.1**

### Property 20: Comprehensive Risk Score Calculation

*For any* KYC_Submission, the risk_score should correctly reflect all risk factors: +20 for missing ID document, +15 for missing student ID card, +10 for missing admission letter (current students only), +10 for missing guardian information, +30 for age under 16, +15 for age over 35, with a maximum cap of 100.

**Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

### Property 21: Document Access Control for Students

*For any* document in the kyc-documents storage bucket, a student user should be able to access the document if and only if the document path starts with their user_id.

**Validates: Requirements 8.3**

### Property 22: Admin Document Access Control

*For any* document in the kyc-documents storage bucket, an admin user should be able to access the document regardless of which user uploaded it.

**Validates: Requirements 8.4**

### Property 23: Public Access Prevention

*For any* document in the kyc-documents storage bucket, unauthenticated requests should be denied access.

**Validates: Requirements 8.5**

### Property 24: Nigerian Phone Number Format Validation

*For any* phone number input, the system should accept the value if and only if it matches the Nigerian phone number format (+234 followed by 10 digits).

**Validates: Requirements 10.2**

### Property 25: Institution Name Free-Text Entry

*For any* institution name input, the system should accept the value without validation restrictions, allowing any non-empty string.

**Validates: Requirements 10.4**

### Property 26: LGA Free-Text Entry

*For any* LGA input, the system should accept the value without validation restrictions, allowing any non-empty string.

**Validates: Requirements 10.5**

### Property 27: Required Field Validation Errors

*For any* required field left empty in the form, the system should display an error message indicating that the field is required and prevent form submission.

**Validates: Requirements 11.1**

### Property 28: Date of Birth Validation

*For any* date of birth input, the system should display a validation error if the date is in the future or results in an age outside the realistic range (under 16 or over 100 years old).

**Validates: Requirements 11.2**

### Property 29: Phone Number Format Error Display

*For any* invalid phone number format input, the system should display a format error message with an example of the correct format.

**Validates: Requirements 11.3**

### Property 30: File Size Limit Enforcement

*For any* file upload attempt, the system should reject files larger than 5MB and display a size limit error message.

**Validates: Requirements 11.4**

### Property 31: Non-Admin Access Denial to Admin Interface

*For any* user without admin role attempting to access the Admin_Review_Interface, the system should redirect to the user dashboard and display an error message.

**Validates: Requirements 12.3**
