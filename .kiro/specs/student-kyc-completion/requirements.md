# Requirements Document: Student KYC Completion

## Introduction

This document specifies the requirements for completing the Student KYC (Know Your Customer) verification system for the Campus Comfort platform. The system enables Nigerian students to verify their identity by submitting personal information, student credentials, and supporting documents. Administrators can review submissions, assess risk, and approve or reject verification requests. The system builds upon an existing database schema and partially implemented form component.

## Glossary

- **Student_KYC_System**: The complete identity verification system for student users
- **Student_User**: A user with role "user" who is submitting KYC verification
- **Admin_User**: A user with role "admin" who reviews and approves KYC submissions
- **KYC_Form**: The multi-step form interface for students to submit verification data
- **KYC_Submission**: A complete set of student verification data stored in the student_kyc table
- **Verification_Status**: The current state of a KYC submission (pending, under_review, verified, rejected, requires_update)
- **Risk_Score**: An automatically calculated integer from 0-100 indicating verification risk level
- **Document_Storage**: Supabase storage bucket "kyc-documents" for secure file storage
- **Admin_Review_Interface**: The administrative dashboard for reviewing KYC submissions

## Requirements

### Requirement 1: Student KYC Form Completion

**User Story:** As a student user, I want to complete a comprehensive 4-step KYC form, so that I can verify my identity and access housing services.

#### Acceptance Criteria

1. WHEN a Student_User accesses the KYC_Form, THE Student_KYC_System SHALL display a tabbed interface with Personal Information, Student Information, Documents, and Guardian Information tabs
2. WHEN a Student_User completes the Personal Information tab, THE Student_KYC_System SHALL validate all required fields (full name, date of birth, gender, phone number, email, current address, state of origin, LGA, ID type, ID number) before allowing progression
3. WHEN a Student_User completes the Student Information tab, THE Student_KYC_System SHALL collect student status, institution name, institution state, student ID number, matriculation number, admission year, expected graduation year, course of study, and level of study
4. WHEN a Student_User uploads documents in the Documents tab, THE Student_KYC_System SHALL accept files for ID document, student ID card, admission letter, school ID card, and current semester receipt
5. WHEN a Student_User completes the Guardian Information tab, THE Student_KYC_System SHALL collect guardian name, phone, relationship, and address
6. WHEN a Student_User submits the complete KYC_Form, THE Student_KYC_System SHALL create a KYC_Submission with verification_status set to "pending"

### Requirement 2: Document Upload and Storage

**User Story:** As a student user, I want to securely upload my verification documents, so that administrators can review my identity proof.

#### Acceptance Criteria

1. WHEN a Student_User selects a document file, THE Student_KYC_System SHALL validate the file type is an image or PDF
2. WHEN a Student_User uploads a document, THE Student_KYC_System SHALL store the file in the Document_Storage bucket with path format "{user_id}/{document_type}_{timestamp}.{extension}"
3. WHEN a document upload completes, THE Student_KYC_System SHALL store the public URL in the corresponding KYC_Submission field
4. WHEN a document upload fails, THE Student_KYC_System SHALL display an error message and allow retry
5. WHEN all documents are uploaded, THE Student_KYC_System SHALL display a visual confirmation showing which documents have been successfully uploaded

### Requirement 3: KYC Status Display for Students

**User Story:** As a student user, I want to view my KYC submission status, so that I know whether my verification is pending, approved, or requires action.

#### Acceptance Criteria

1. WHEN a Student_User has submitted a KYC_Submission, THE Student_KYC_System SHALL display the current Verification_Status on their dashboard
2. WHEN a KYC_Submission has Verification_Status "verified", THE Student_KYC_System SHALL display a success indicator with verification date
3. WHEN a KYC_Submission has Verification_Status "rejected", THE Student_KYC_System SHALL display the rejection_reason to the Student_User
4. WHEN a KYC_Submission has Verification_Status "requires_update", THE Student_KYC_System SHALL display admin_notes and enable the Student_User to edit and resubmit
5. WHEN a Student_User has no KYC_Submission, THE Student_KYC_System SHALL display a call-to-action button to start KYC verification

### Requirement 4: KYC Form Update Capability

**User Story:** As a student user, I want to update my KYC submission when required, so that I can provide additional information or correct errors.

#### Acceptance Criteria

1. WHEN a KYC_Submission has Verification_Status "pending" or "requires_update", THE Student_KYC_System SHALL allow the Student_User to edit the submission
2. WHEN a Student_User updates a KYC_Submission, THE Student_KYC_System SHALL preserve existing document URLs unless new documents are uploaded
3. WHEN a Student_User resubmits an updated KYC_Submission, THE Student_KYC_System SHALL reset Verification_Status to "pending" and update the updated_at timestamp
4. WHEN a KYC_Submission has Verification_Status "verified" or "under_review", THE Student_KYC_System SHALL prevent editing by the Student_User

### Requirement 5: Admin KYC Review Interface

**User Story:** As an admin user, I want to view and review all student KYC submissions, so that I can verify student identities and approve legitimate users.

#### Acceptance Criteria

1. WHEN an Admin_User accesses the Admin_Review_Interface, THE Student_KYC_System SHALL display a list of all KYC_Submissions with student name, institution, submission date, and Verification_Status
2. WHEN an Admin_User filters by Verification_Status, THE Student_KYC_System SHALL display only KYC_Submissions matching the selected status
3. WHEN an Admin_User selects a KYC_Submission, THE Student_KYC_System SHALL display all submitted information including personal details, student information, guardian information, and Risk_Score
4. WHEN an Admin_User views a KYC_Submission, THE Student_KYC_System SHALL display clickable links to all uploaded documents
5. WHEN an Admin_User clicks a document link, THE Student_KYC_System SHALL open the document in a new tab or modal for review

### Requirement 6: Admin Approval and Rejection Actions

**User Story:** As an admin user, I want to approve or reject KYC submissions with notes, so that I can control which students are verified on the platform.

#### Acceptance Criteria

1. WHEN an Admin_User approves a KYC_Submission, THE Student_KYC_System SHALL update Verification_Status to "verified", set verified_at to current timestamp, and record reviewed_by as the Admin_User's ID
2. WHEN an Admin_User rejects a KYC_Submission, THE Student_KYC_System SHALL update Verification_Status to "rejected", require a rejection_reason, and record reviewed_by as the Admin_User's ID
3. WHEN an Admin_User marks a KYC_Submission as "requires_update", THE Student_KYC_System SHALL require admin_notes explaining what needs to be updated
4. WHEN an Admin_User saves review notes, THE Student_KYC_System SHALL store the notes in the admin_notes field and update reviewed_at timestamp
5. WHEN an Admin_User changes Verification_Status, THE Student_KYC_System SHALL send a notification to the Student_User

### Requirement 7: Automatic Risk Score Calculation

**User Story:** As an admin user, I want to see automatically calculated risk scores, so that I can prioritize high-risk submissions for detailed review.

#### Acceptance Criteria

1. WHEN a KYC_Submission is created or updated, THE Student_KYC_System SHALL calculate the Risk_Score using the calculate_kyc_risk_score database function
2. WHEN a KYC_Submission is missing an ID document, THE Student_KYC_System SHALL add 20 points to the Risk_Score
3. WHEN a KYC_Submission is missing a student ID card, THE Student_KYC_System SHALL add 15 points to the Risk_Score
4. WHEN a current student KYC_Submission is missing an admission letter, THE Student_KYC_System SHALL add 10 points to the Risk_Score
5. WHEN a KYC_Submission is missing guardian information, THE Student_KYC_System SHALL add 10 points to the Risk_Score
6. WHEN a Student_User's age is below 16 or above 35, THE Student_KYC_System SHALL add risk points accordingly (30 for under 16, 15 for over 35)
7. WHEN the calculated Risk_Score exceeds 100, THE Student_KYC_System SHALL cap it at 100

### Requirement 8: Storage Bucket Configuration

**User Story:** As a system administrator, I want KYC documents stored securely with proper access controls, so that sensitive student documents are protected.

#### Acceptance Criteria

1. THE Student_KYC_System SHALL create a Document_Storage bucket named "kyc-documents" if it does not exist
2. THE Student_KYC_System SHALL configure Document_Storage with row-level security policies
3. WHEN a Student_User uploads a document, THE Student_KYC_System SHALL allow access only if the user_id matches the authenticated user
4. WHEN an Admin_User accesses documents, THE Student_KYC_System SHALL allow access if the user has role "admin"
5. THE Student_KYC_System SHALL prevent public access to documents in Document_Storage

### Requirement 9: User Dashboard Integration

**User Story:** As a student user, I want to access KYC verification from my dashboard, so that I can easily find and complete the verification process.

#### Acceptance Criteria

1. WHEN a Student_User views their dashboard, THE Student_KYC_System SHALL display a KYC verification status card
2. WHEN a Student_User has no KYC_Submission, THE Student_KYC_System SHALL display a prominent "Verify Your Identity" button in the dashboard
3. WHEN a Student_User clicks the verification button, THE Student_KYC_System SHALL navigate to the KYC_Form page
4. WHEN a Student_User has a pending KYC_Submission, THE Student_KYC_System SHALL display "Verification Pending" status with submission date
5. WHEN a Student_User has a verified KYC_Submission, THE Student_KYC_System SHALL display a verified badge with verification date

### Requirement 10: Nigerian Context Support

**User Story:** As a Nigerian student, I want the system to support Nigerian-specific data formats, so that I can provide accurate information relevant to my country.

#### Acceptance Criteria

1. THE Student_KYC_System SHALL provide a dropdown list of all 36 Nigerian states plus FCT for state selection fields
2. THE Student_KYC_System SHALL accept Nigerian phone numbers in the format +234XXXXXXXXXX
3. THE Student_KYC_System SHALL support Nigerian identification types: NIN, Voter's Card, Driver's License, International Passport, and Student ID
4. THE Student_KYC_System SHALL allow entry of Nigerian institution names without validation restrictions
5. THE Student_KYC_System SHALL support Nigerian Local Government Areas (LGAs) as free-text input

### Requirement 11: Form Validation and Error Handling

**User Story:** As a student user, I want clear validation messages, so that I can correct errors before submitting my KYC.

#### Acceptance Criteria

1. WHEN a Student_User leaves a required field empty, THE Student_KYC_System SHALL display an error message indicating the field is required
2. WHEN a Student_User enters an invalid date of birth (future date or unrealistic age), THE Student_KYC_System SHALL display a validation error
3. WHEN a Student_User enters an invalid phone number format, THE Student_KYC_System SHALL display a format error with example
4. WHEN a Student_User attempts to upload a file larger than 5MB, THE Student_KYC_System SHALL reject the upload and display a size limit error
5. WHEN a Student_User attempts to upload an unsupported file type, THE Student_KYC_System SHALL reject the upload and display accepted file types (JPEG, PNG, PDF)

### Requirement 12: Admin Navigation and Access Control

**User Story:** As an admin user, I want a dedicated KYC management page in the admin dashboard, so that I can easily access and manage student verifications.

#### Acceptance Criteria

1. WHEN an Admin_User views the admin navigation menu, THE Student_KYC_System SHALL display a "Student KYC" menu item
2. WHEN an Admin_User clicks the "Student KYC" menu item, THE Student_KYC_System SHALL navigate to the Admin_Review_Interface
3. WHEN a non-admin user attempts to access the Admin_Review_Interface, THE Student_KYC_System SHALL redirect to the user dashboard with an error message
4. WHEN an Admin_User accesses the Admin_Review_Interface, THE Student_KYC_System SHALL load KYC_Submissions using the student_kyc_summary view for optimized performance
