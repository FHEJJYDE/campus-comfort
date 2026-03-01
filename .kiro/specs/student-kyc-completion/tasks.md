# Implementation Plan: Student KYC Completion

## Overview

This implementation plan completes the Student KYC verification system for Campus Comfort. The work builds on the existing `student_kyc` database table and partially implemented `StudentKYCForm.tsx` component. The implementation follows an incremental approach: complete the student-facing form first, then add document storage, implement the admin review interface, and finally integrate everything into the user dashboard.

## Tasks

- [x] 1. Set up storage bucket and RLS policies
  - Create "kyc-documents" storage bucket in Supabase
  - Configure bucket settings (5MB limit, JPEG/PNG/PDF only)
  - Add RLS policy for user uploads (users can upload to their own folder)
  - Add RLS policy for user reads (users can read their own documents)
  - Add RLS policy for admin reads (admins can read all documents)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 2. Complete StudentKYCForm component with all tabs
  - [x] 2.1 Add Student Information tab implementation
    - Create form fields for student status, institution name, institution state
    - Add fields for student ID number, matriculation number
    - Add fields for admission year, expected graduation year, course of study, level of study
    - Implement validation for student information fields
    - Add "Next" button to progress to Documents tab
    - _Requirements: 1.3_

  - [x] 2.2 Add Documents tab implementation
    - Create file input components for each document type (ID, student ID card, admission letter, school ID card, semester receipt)
    - Implement file selection handlers with file type validation (JPEG, PNG, PDF)
    - Add file size validation (5MB limit)
    - Display file preview thumbnails after selection
    - Show upload progress indicators
    - Display visual confirmation of successfully uploaded documents
    - Add "Next" button to progress to Guardian tab
    - _Requirements: 1.4, 2.1, 2.4, 2.5, 11.4, 11.5_

  - [x] 2.3 Add Guardian Information tab implementation
    - Create form fields for guardian name, phone, relationship, address
    - Implement validation for guardian phone number (Nigerian format)
    - Mark fields as optional but recommended
    - Add "Submit" button to complete form
    - _Requirements: 1.5_

  - [x] 2.4 Implement document upload functionality
    - Create uploadDocument function that uploads to storage bucket with correct path format
    - Generate public URLs for uploaded documents
    - Store URLs in form state
    - Implement retry logic for failed uploads (3 attempts with exponential backoff)
    - Handle upload errors with user-friendly messages
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 2.5 Implement form submission logic
    - Upload all selected documents before submitting form data
    - Create student_kyc record with all form data and document URLs
    - Set verification_status to "pending"
    - Handle submission errors and display appropriate messages
    - Show success toast on successful submission
    - _Requirements: 1.6_

  - [x] 2.6 Add form update capability
    - Load existing submission data when editing
    - Preserve existing document URLs when no new document is uploaded
    - Replace document URLs when new documents are uploaded
    - Reset verification_status to "pending" on resubmission
    - Only allow editing when status is "pending" or "requires_update"
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.7 Write property test for form tab validation
    - **Property 1: Form Tab Validation Prevents Invalid Progression**
    - **Validates: Requirements 1.2**

  - [ ]* 2.8 Write property test for new submission status
    - **Property 2: New Submissions Always Start as Pending**
    - **Validates: Requirements 1.6**

  - [ ]* 2.9 Write property test for file type validation
    - **Property 3: File Type Validation Accepts Only Valid Formats**
    - **Validates: Requirements 2.1, 11.5**

  - [ ]* 2.10 Write property test for document upload path format
    - **Property 4: Document Upload Path Format Consistency**
    - **Validates: Requirements 2.2**

  - [ ]* 2.11 Write property test for document URL storage
    - **Property 5: Document URL Storage After Upload**
    - **Validates: Requirements 2.3**

  - [ ]* 2.12 Write property test for document URL preservation
    - **Property 10: Document URL Preservation During Updates**
    - **Validates: Requirements 4.2**

  - [ ]* 2.13 Write property test for resubmission status reset
    - **Property 11: Resubmission Resets Status and Updates Timestamp**
    - **Validates: Requirements 4.3**

- [ ] 3. Create KYCStatusDisplay component
  - [x] 3.1 Implement KYCStatusDisplay component
    - Create component with props for submission data and action handlers
    - Implement "no submission" state with "Start Verification" CTA button
    - Implement "pending" state with submission date display
    - Implement "under_review" state with status message
    - Implement "verified" state with success badge and verification date
    - Implement "rejected" state with rejection reason display and "Update" button
    - Implement "requires_update" state with admin notes and "Update" button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test for status display
    - **Property 8: Status Display Reflects Current Verification State**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 4. Checkpoint - Test student-facing KYC flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create admin KYC review components
  - [x] 5.1 Create KYCSubmissionList component
    - Create table component displaying submission summaries
    - Show columns: student name, institution, submission date, status, risk score
    - Implement status filter dropdown (all, pending, under_review, verified, rejected, requires_update)
    - Add search functionality for student name or email
    - Implement row selection to view details
    - Use student_kyc_summary view for data loading
    - _Requirements: 5.1, 5.2, 12.4_

  - [ ] 5.2 Create DocumentViewer component
    - Create modal component for document viewing
    - Display images (JPEG, PNG) with preview
    - Display PDFs with embedded viewer or download option
    - Add close button
    - Add download button
    - _Requirements: 5.5_

  - [x] 5.3 Create KYCSubmissionDetail component
    - Create detail view component with sections for personal info, student info, guardian info
    - Display all submission data in read-only format
    - Show risk score and risk flags prominently
    - Display clickable document links that open DocumentViewer
    - Add action buttons: Approve, Reject, Request Update
    - Implement approval action (updates status to "verified", sets verified_at, records reviewed_by)
    - Implement rejection action (requires rejection_reason, updates status to "rejected", records reviewed_by)
    - Implement request update action (requires admin_notes, updates status to "requires_update")
    - Add admin notes textarea for all actions
    - _Requirements: 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.4 Write property test for admin filter
    - **Property 12: Admin Filter Shows Only Matching Submissions**
    - **Validates: Requirements 5.2**

  - [ ]* 5.5 Write property test for document links
    - **Property 13: Document Links Present for All Uploaded Documents**
    - **Validates: Requirements 5.4**

  - [ ]* 5.6 Write property test for approval action
    - **Property 14: Approval Updates All Required Fields**
    - **Validates: Requirements 6.1**

  - [ ]* 5.7 Write property test for rejection action
    - **Property 15: Rejection Requires Reason and Updates Fields**
    - **Validates: Requirements 6.2**

  - [ ]* 5.8 Write property test for requires update action
    - **Property 16: Requires Update Action Mandates Admin Notes**
    - **Validates: Requirements 6.3**

  - [ ]* 5.9 Write property test for review notes storage
    - **Property 17: Review Notes Storage Updates Timestamp**
    - **Validates: Requirements 6.4**

- [ ] 6. Create AdminStudentKYC page
  - [x] 6.1 Create AdminStudentKYC page component
    - Create page layout with left panel for list and right panel for details
    - Integrate KYCSubmissionList component in left panel
    - Integrate KYCSubmissionDetail component in right panel
    - Implement state management for selected submission
    - Add loading states and error handling
    - Implement real-time updates when submissions change
    - _Requirements: 5.1_

  - [x] 6.2 Add admin navigation menu item
    - Add "Student KYC" menu item to admin navigation
    - Link to AdminStudentKYC page
    - Add appropriate icon (Shield or FileText)
    - _Requirements: 12.1, 12.2_

  - [ ] 6.3 Implement admin access control
    - Add route protection for AdminStudentKYC page
    - Redirect non-admin users to dashboard with error message
    - Check user role from profiles table
    - _Requirements: 12.3_

  - [ ]* 6.4 Write property test for non-admin access denial
    - **Property 31: Non-Admin Access Denial to Admin Interface**
    - **Validates: Requirements 12.3**

- [x] 7. Integrate KYC into user dashboard
  - [x] 7.1 Add KYC status card to user dashboard
    - Create KYC status card component for dashboard
    - Fetch user's KYC submission on dashboard load
    - Display KYCStatusDisplay component in card
    - Add "Verify Your Identity" button when no submission exists
    - Link button to KYC form page
    - Show current status when submission exists
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 7.2 Create KYC form page route
    - Add route for KYC form page (e.g., /dashboard/kyc)
    - Render StudentKYCForm component
    - Pass existing submission data if updating
    - Redirect to dashboard after successful submission
    - _Requirements: 9.3_

- [ ] 8. Implement notification system for status changes
  - [ ] 8.1 Create notification trigger for status changes
    - Create database function to send notification on status change
    - Trigger notification when verification_status is updated
    - Include status, rejection_reason, and admin_notes in notification
    - Store notification in notifications table
    - _Requirements: 6.5_

  - [ ]* 8.2 Write property test for status change notifications
    - **Property 18: Status Changes Trigger Notifications**
    - **Validates: Requirements 6.5**

- [ ] 9. Implement risk score calculation integration
  - [ ] 9.1 Add risk score calculation trigger
    - Create database trigger to calculate risk score on insert/update
    - Call calculate_kyc_risk_score function automatically
    - Update risk_score field with calculated value
    - _Requirements: 7.1_

  - [ ] 9.2 Display risk score in admin interface
    - Show risk score prominently in submission list
    - Color-code risk scores (green: 0-30, yellow: 31-60, red: 61-100)
    - Display risk flags if present
    - Add sorting by risk score
    - _Requirements: 7.1_

  - [ ]* 9.3 Write property test for risk score calculation
    - **Property 19: Risk Score Calculation on Submission Changes**
    - **Validates: Requirements 7.1**

  - [ ]* 9.4 Write property test for comprehensive risk scoring
    - **Property 20: Comprehensive Risk Score Calculation**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

- [ ] 10. Add form validation and error handling
  - [ ] 10.1 Implement comprehensive form validation
    - Add required field validation for all mandatory fields
    - Implement date of birth validation (age 16-100)
    - Add Nigerian phone number format validation (+234XXXXXXXXXX)
    - Implement file size validation (5MB limit)
    - Add file type validation (JPEG, PNG, PDF only)
    - Display inline error messages for invalid fields
    - Prevent form submission when validation fails
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 10.2 Add Nigerian context support
    - Create constant array of 36 Nigerian states plus FCT
    - Populate state dropdowns with Nigerian states
    - Allow free-text entry for institution names
    - Allow free-text entry for LGA names
    - Add Nigerian ID type options (NIN, Voter's Card, Driver's License, International Passport, Student ID)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 10.3 Write property test for Nigerian phone validation
    - **Property 24: Nigerian Phone Number Format Validation**
    - **Validates: Requirements 10.2**

  - [ ]* 10.4 Write property test for institution name entry
    - **Property 25: Institution Name Free-Text Entry**
    - **Validates: Requirements 10.4**

  - [ ]* 10.5 Write property test for LGA entry
    - **Property 26: LGA Free-Text Entry**
    - **Validates: Requirements 10.5**

  - [ ]* 10.6 Write property test for required field validation
    - **Property 27: Required Field Validation Errors**
    - **Validates: Requirements 11.1**

  - [ ]* 10.7 Write property test for date of birth validation
    - **Property 28: Date of Birth Validation**
    - **Validates: Requirements 11.2**

  - [ ]* 10.8 Write property test for phone format errors
    - **Property 29: Phone Number Format Error Display**
    - **Validates: Requirements 11.3**

  - [ ]* 10.9 Write property test for file size limit
    - **Property 30: File Size Limit Enforcement**
    - **Validates: Requirements 11.4**

- [ ] 11. Implement storage access control
  - [ ]* 11.1 Write property test for student document access
    - **Property 21: Document Access Control for Students**
    - **Validates: Requirements 8.3**

  - [ ]* 11.2 Write property test for admin document access
    - **Property 22: Admin Document Access Control**
    - **Validates: Requirements 8.4**

  - [ ]* 11.3 Write property test for public access prevention
    - **Property 23: Public Access Prevention**
    - **Validates: Requirements 8.5**

- [ ] 12. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation follows an incremental approach: student form → admin interface → dashboard integration
- Storage bucket setup is done first to enable document uploads
- Property tests validate universal correctness properties across all inputs
- All property tests should run minimum 100 iterations using fast-check library
