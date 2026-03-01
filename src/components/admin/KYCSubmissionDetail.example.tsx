/**
 * Example Usage of KYCSubmissionDetail Component
 * 
 * This component displays detailed information about a KYC submission
 * and provides admin actions (Approve, Reject, Request Update).
 * 
 * Usage in AdminStudentKYC page:
 * 
 * ```tsx
 * import { useState } from "react";
 * import { KYCSubmissionList } from "@/components/admin/KYCSubmissionList";
 * import { KYCSubmissionDetail } from "@/components/admin/KYCSubmissionDetail";
 * 
 * export function AdminStudentKYC() {
 *   const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
 * 
 *   const handleSelectSubmission = (submission: any) => {
 *     setSelectedSubmission(submission);
 *   };
 * 
 *   const handleActionComplete = () => {
 *     // Refresh the submission list
 *     setSelectedSubmission(null);
 *     // Optionally refetch the list
 *   };
 * 
 *   return (
 *     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 *       <div>
 *         <KYCSubmissionList
 *           onSelectSubmission={handleSelectSubmission}
 *           selectedSubmissionId={selectedSubmission?.id}
 *         />
 *       </div>
 *       <div>
 *         <KYCSubmissionDetail
 *           submission={selectedSubmission}
 *           onActionComplete={handleActionComplete}
 *         />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Features:
 * - Displays all submission data in organized sections
 * - Shows risk score with color-coded indicators
 * - Provides clickable document links that open in new tab
 * - Admin action buttons: Approve, Reject, Request Update
 * - Approval: Updates status to "verified", sets verified_at, records reviewed_by
 * - Rejection: Requires rejection_reason, updates status to "rejected", records reviewed_by
 * - Request Update: Requires admin_notes, updates status to "requires_update"
 * - All actions include optional admin notes textarea
 * - Confirmation dialogs for all actions
 * - Real-time database updates via Supabase
 */

export { };
