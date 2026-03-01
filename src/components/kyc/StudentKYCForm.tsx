import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    User,
    GraduationCap,
    Shield,
    Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Nigerian states
const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
];

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Document Upload Field Component
interface DocumentUploadFieldProps {
    label: string;
    description: string;
    file: File | null;
    onChange: (file: File | null) => void;
    required?: boolean;
}

function DocumentUploadField({ label, description, file, onChange, required }: DocumentUploadFieldProps) {
    const [error, setError] = useState<string>("");
    const [preview, setPreview] = useState<string>("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError("");

        if (!selectedFile) {
            onChange(null);
            setPreview("");
            return;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            setError("Please upload JPEG, PNG, or PDF files only");
            onChange(null);
            setPreview("");
            return;
        }

        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size must be under 5MB");
            onChange(null);
            setPreview("");
            return;
        }

        // Set file and preview
        onChange(selectedFile);

        // Generate preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview("");
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreview("");
        setError("");
    };

    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <p className="text-sm text-muted-foreground">{description}</p>

            {!file ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Label htmlFor={label} className="cursor-pointer">
                        <span className="text-sm text-primary hover:underline">
                            Click to upload
                        </span>
                        <span className="text-sm text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, or PDF (max 5MB)
                    </p>
                    <Input
                        id={label}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded border"
                                />
                            ) : (
                                <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                                <div className="flex items-center mt-1">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-xs text-green-600">Ready to upload</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="ml-2"
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                </div>
            )}
        </div>
    );
}

interface StudentKYCFormProps {
    existingSubmission?: any | null;
    onSubmitSuccess?: () => void;
}

export function StudentKYCForm({ existingSubmission, onSubmitSuccess }: StudentKYCFormProps = {}) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState("personal");
    const [guardianPhoneError, setGuardianPhoneError] = useState("");
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const isEditMode = !!existingSubmission;

    const [formData, setFormData] = useState({
        // Personal Info
        full_name: "",
        date_of_birth: "",
        gender: "",
        phone_number: "",
        email: user?.email || "",
        current_address: "",
        state_of_origin: "",
        lga_of_origin: "",

        // Student Info
        student_status: "",
        institution_name: "",
        institution_state: "",
        student_id_number: "",
        matriculation_number: "",
        admission_year: "",
        expected_graduation_year: "",
        course_of_study: "",
        level_of_study: "",

        // ID Info
        id_type: "",
        id_number: "",

        // Guardian Info
        guardian_name: "",
        guardian_phone: "",
        guardian_relationship: "",
        guardian_address: "",
    });

    const [documents, setDocuments] = useState({
        id_document: null as File | null,
        student_id_card: null as File | null,
        admission_letter: null as File | null,
        school_id_card: null as File | null,
        current_semester_receipt: null as File | null,
    });

    // Load existing submission data when editing
    useEffect(() => {
        if (existingSubmission) {
            // Check if editing is allowed
            const allowedStatuses = ['pending', 'requires_update'];
            if (!allowedStatuses.includes(existingSubmission.verification_status)) {
                toast({
                    title: "Cannot Edit",
                    description: `KYC submissions with status "${existingSubmission.verification_status}" cannot be edited.`,
                    variant: "destructive"
                });
                return;
            }

            // Populate form data
            setFormData({
                full_name: existingSubmission.full_name || "",
                date_of_birth: existingSubmission.date_of_birth || "",
                gender: existingSubmission.gender || "",
                phone_number: existingSubmission.phone_number || "",
                email: existingSubmission.email || "",
                current_address: existingSubmission.current_address || "",
                state_of_origin: existingSubmission.state_of_origin || "",
                lga_of_origin: existingSubmission.lga_of_origin || "",
                student_status: existingSubmission.student_status || "",
                institution_name: existingSubmission.institution_name || "",
                institution_state: existingSubmission.institution_state || "",
                student_id_number: existingSubmission.student_id_number || "",
                matriculation_number: existingSubmission.matriculation_number || "",
                admission_year: existingSubmission.admission_year ? String(existingSubmission.admission_year) : "",
                expected_graduation_year: existingSubmission.expected_graduation_year ? String(existingSubmission.expected_graduation_year) : "",
                course_of_study: existingSubmission.course_of_study || "",
                level_of_study: existingSubmission.level_of_study || "",
                id_type: existingSubmission.id_type || "",
                id_number: existingSubmission.id_number || "",
                guardian_name: existingSubmission.guardian_name || "",
                guardian_phone: existingSubmission.guardian_phone || "",
                guardian_relationship: existingSubmission.guardian_relationship || "",
                guardian_address: existingSubmission.guardian_address || "",
            });
        }
    }, [existingSubmission, toast]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate guardian phone number if it's being changed
        if (field === 'guardian_phone') {
            validateGuardianPhone(value);
        }
    };

    const validateGuardianPhone = (phone: string) => {
        // If empty, it's optional so no error
        if (!phone || phone.trim() === '') {
            setGuardianPhoneError('');
            return true;
        }

        // Nigerian phone format: +234 followed by 10 digits
        const nigerianPhoneRegex = /^\+234\d{10}$/;

        if (!nigerianPhoneRegex.test(phone.replace(/\s/g, ''))) {
            setGuardianPhoneError('Please enter a valid Nigerian phone number (e.g., +2348012345678)');
            return false;
        }

        setGuardianPhoneError('');
        return true;
    };

    const handleFileChange = (field: string, file: File | null) => {
        setDocuments(prev => ({ ...prev, [field]: file }));
    };

    const uploadDocument = async (file: File, path: string): Promise<string | null> => {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const fileExt = file.name.split('.').pop();
                const timestamp = Date.now();
                const fileName = `${user!.id}/${path}_${timestamp}.${fileExt}`;

                // Update progress
                setUploadProgress(prev => ({ ...prev, [path]: 0 }));

                const { data, error } = await supabase.storage
                    .from('kyc-documents')
                    .upload(fileName, file);

                if (error) {
                    // Check if it's a retryable error
                    const isRetryable = error.message.includes('network') ||
                        error.message.includes('timeout') ||
                        error.message.includes('connection');

                    if (!isRetryable || attempt === maxRetries) {
                        throw error;
                    }

                    // Exponential backoff: 1s, 2s, 4s
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`Upload attempt ${attempt} failed for ${path}, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('kyc-documents')
                    .getPublicUrl(fileName);

                // Update progress to 100%
                setUploadProgress(prev => ({ ...prev, [path]: 100 }));

                return publicUrl;
            } catch (error: any) {
                console.error(`Error uploading ${path} (attempt ${attempt}/${maxRetries}):`, error);

                // If this is the last attempt, throw a user-friendly error
                if (attempt === maxRetries) {
                    const errorMessage = error.message || 'Unknown error';

                    // Provide specific error messages based on error type
                    if (errorMessage.includes('storage/object-not-found')) {
                        throw new Error(`Upload failed: Storage bucket not found. Please contact support.`);
                    } else if (errorMessage.includes('storage/unauthorized')) {
                        throw new Error(`Upload failed: You don't have permission to upload files. Please log in again.`);
                    } else if (errorMessage.includes('storage/quota-exceeded')) {
                        throw new Error(`Upload failed: Storage quota exceeded. Please contact support.`);
                    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                        throw new Error(`Upload failed: Network connection lost. Please check your internet and try again.`);
                    } else {
                        throw new Error(`Upload failed: ${errorMessage}. Please try again.`);
                    }
                }

                // Exponential backoff for next retry
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to submit KYC",
                variant: "destructive"
            });
            return;
        }

        // Check if editing is allowed for existing submissions
        if (isEditMode && existingSubmission) {
            const allowedStatuses = ['pending', 'requires_update'];
            if (!allowedStatuses.includes(existingSubmission.verification_status)) {
                toast({
                    title: "Cannot Edit",
                    description: `KYC submissions with status "${existingSubmission.verification_status}" cannot be edited.`,
                    variant: "destructive"
                });
                return;
            }
        }

        // Validate guardian phone if provided
        if (formData.guardian_phone && !validateGuardianPhone(formData.guardian_phone)) {
            toast({
                title: "Validation Error",
                description: "Please correct the guardian phone number format",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            // Upload documents with better error handling
            const documentUrls: any = {};
            const uploadErrors: string[] = [];

            // Upload each document and track errors
            // For edit mode, preserve existing URLs if no new file is uploaded
            if (documents.id_document) {
                try {
                    documentUrls.id_document_url = await uploadDocument(documents.id_document, 'id_document');
                } catch (error: any) {
                    uploadErrors.push(`ID Document: ${error.message}`);
                }
            } else if (isEditMode && existingSubmission?.id_document_url) {
                documentUrls.id_document_url = existingSubmission.id_document_url;
            }

            if (documents.student_id_card) {
                try {
                    documentUrls.student_id_card_url = await uploadDocument(documents.student_id_card, 'student_id');
                } catch (error: any) {
                    uploadErrors.push(`Student ID Card: ${error.message}`);
                }
            } else if (isEditMode && existingSubmission?.student_id_card_url) {
                documentUrls.student_id_card_url = existingSubmission.student_id_card_url;
            }

            if (documents.admission_letter) {
                try {
                    documentUrls.admission_letter_url = await uploadDocument(documents.admission_letter, 'admission');
                } catch (error: any) {
                    uploadErrors.push(`Admission Letter: ${error.message}`);
                }
            } else if (isEditMode && existingSubmission?.admission_letter_url) {
                documentUrls.admission_letter_url = existingSubmission.admission_letter_url;
            }

            if (documents.school_id_card) {
                try {
                    documentUrls.school_id_card_url = await uploadDocument(documents.school_id_card, 'school_id');
                } catch (error: any) {
                    uploadErrors.push(`School ID Card: ${error.message}`);
                }
            } else if (isEditMode && existingSubmission?.school_id_card_url) {
                documentUrls.school_id_card_url = existingSubmission.school_id_card_url;
            }

            if (documents.current_semester_receipt) {
                try {
                    documentUrls.current_semester_receipt_url = await uploadDocument(documents.current_semester_receipt, 'receipt');
                } catch (error: any) {
                    uploadErrors.push(`Semester Receipt: ${error.message}`);
                }
            } else if (isEditMode && existingSubmission?.current_semester_receipt_url) {
                documentUrls.current_semester_receipt_url = existingSubmission.current_semester_receipt_url;
            }

            // If there were upload errors, show them and stop
            if (uploadErrors.length > 0) {
                toast({
                    title: "Upload Failed",
                    description: uploadErrors.join('\n'),
                    variant: "destructive"
                });
                return;
            }

            // Prepare submission data
            const submissionData = {
                ...formData,
                ...documentUrls,
                admission_year: formData.admission_year ? parseInt(formData.admission_year) : null,
                expected_graduation_year: formData.expected_graduation_year ? parseInt(formData.expected_graduation_year) : null,
            };

            if (isEditMode && existingSubmission) {
                // UPDATE existing submission
                // Reset verification_status to "pending" on resubmission
                const { error: updateError } = await supabase
                    .from('student_kyc')
                    .update({
                        ...submissionData,
                        verification_status: 'pending',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingSubmission.id)
                    .eq('user_id', user.id);

                if (updateError) {
                    throw updateError;
                }

                toast({
                    title: "Success!",
                    description: "Your KYC submission has been updated and is under review. You will be notified once it's processed.",
                });
            } else {
                // INSERT new submission
                const { error: insertError } = await supabase
                    .from('student_kyc')
                    .insert({
                        user_id: user.id,
                        ...submissionData,
                        verification_status: 'pending',
                        submission_source: 'web_form'
                    });

                if (insertError) {
                    // Handle duplicate submission error specifically
                    if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique constraint')) {
                        toast({
                            title: "Duplicate Submission",
                            description: "You have already submitted KYC. Please update your existing submission instead.",
                            variant: "destructive"
                        });
                        return;
                    }
                    throw insertError;
                }

                toast({
                    title: "Success!",
                    description: "Your KYC submission has been received and is under review. You will be notified once it's processed.",
                });
            }

            // Reset form state only if not in edit mode
            if (!isEditMode) {
                setFormData({
                    full_name: "",
                    date_of_birth: "",
                    gender: "",
                    phone_number: "",
                    email: user?.email || "",
                    current_address: "",
                    state_of_origin: "",
                    lga_of_origin: "",
                    student_status: "",
                    institution_name: "",
                    institution_state: "",
                    student_id_number: "",
                    matriculation_number: "",
                    admission_year: "",
                    expected_graduation_year: "",
                    course_of_study: "",
                    level_of_study: "",
                    id_type: "",
                    id_number: "",
                    guardian_name: "",
                    guardian_phone: "",
                    guardian_relationship: "",
                    guardian_address: "",
                });

                setDocuments({
                    id_document: null,
                    student_id_card: null,
                    admission_letter: null,
                    school_id_card: null,
                    current_semester_receipt: null,
                });

                // Reset to first tab
                setCurrentTab("personal");
            }

            // Call onSubmitSuccess callback if provided
            // This allows parent components to handle navigation or other actions
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (error: any) {
            console.error('Error submitting KYC:', error);

            // Provide specific error messages
            let errorMessage = "Failed to submit KYC. Please try again.";

            if (error.code === '23503' || error.message?.includes('foreign key')) {
                errorMessage = "Invalid user session. Please log in again.";
            } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
                errorMessage = "You don't have permission to submit KYC. Please contact support.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Submission Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            // Clear upload progress
            setUploadProgress({});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">
                        <User className="h-4 w-4 mr-2" />
                        Personal
                    </TabsTrigger>
                    <TabsTrigger value="student">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Student
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                    </TabsTrigger>
                    <TabsTrigger value="guardian">
                        <Users className="h-4 w-4 mr-2" />
                        Guardian
                    </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Provide your personal details as they appear on your official documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        placeholder="As on official documents"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number *</Label>
                                    <Input
                                        id="phone_number"
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                        placeholder="+234 XXX XXX XXXX"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state_of_origin">State of Origin *</Label>
                                    <Select value={formData.state_of_origin} onValueChange={(value) => handleInputChange('state_of_origin', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {nigerianStates.map(state => (
                                                <SelectItem key={state} value={state}>{state}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lga_of_origin">LGA of Origin *</Label>
                                    <Input
                                        id="lga_of_origin"
                                        value={formData.lga_of_origin}
                                        onChange={(e) => handleInputChange('lga_of_origin', e.target.value)}
                                        placeholder="Local Government Area"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="current_address">Current Address *</Label>
                                <Textarea
                                    id="current_address"
                                    value={formData.current_address}
                                    onChange={(e) => handleInputChange('current_address', e.target.value)}
                                    placeholder="Your current residential address"
                                    required
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Identification Type *</Label>
                                <Select value={formData.id_type} onValueChange={(value) => handleInputChange('id_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nin">National Identity Number (NIN)</SelectItem>
                                        <SelectItem value="voters_card">Voter's Card</SelectItem>
                                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                                        <SelectItem value="international_passport">International Passport</SelectItem>
                                        <SelectItem value="student_id">Student ID</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="id_number">ID Number *</Label>
                                <Input
                                    id="id_number"
                                    value={formData.id_number}
                                    onChange={(e) => handleInputChange('id_number', e.target.value)}
                                    placeholder="Enter your ID number"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="button" onClick={() => setCurrentTab("student")}>
                            Next: Student Information
                        </Button>
                    </div>
                </TabsContent>

                {/* Student Information Tab */}
                <TabsContent value="student" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                            <CardDescription>
                                Provide your academic details and institution information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="student_status">Student Status *</Label>
                                    <Select value={formData.student_status} onValueChange={(value) => handleInputChange('student_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current_student">Current Student</SelectItem>
                                            <SelectItem value="prospective_student">Prospective Student</SelectItem>
                                            <SelectItem value="recent_graduate">Recent Graduate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institution_state">Institution State *</Label>
                                    <Select value={formData.institution_state} onValueChange={(value) => handleInputChange('institution_state', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {nigerianStates.map(state => (
                                                <SelectItem key={state} value={state}>{state}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="institution_name">Institution Name *</Label>
                                    <Input
                                        id="institution_name"
                                        value={formData.institution_name}
                                        onChange={(e) => handleInputChange('institution_name', e.target.value)}
                                        placeholder="e.g., University of Lagos"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student_id_number">Student ID Number</Label>
                                    <Input
                                        id="student_id_number"
                                        value={formData.student_id_number}
                                        onChange={(e) => handleInputChange('student_id_number', e.target.value)}
                                        placeholder="Your student ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="matriculation_number">Matriculation Number</Label>
                                    <Input
                                        id="matriculation_number"
                                        value={formData.matriculation_number}
                                        onChange={(e) => handleInputChange('matriculation_number', e.target.value)}
                                        placeholder="Your matric number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admission_year">Admission Year</Label>
                                    <Input
                                        id="admission_year"
                                        type="number"
                                        value={formData.admission_year}
                                        onChange={(e) => handleInputChange('admission_year', e.target.value)}
                                        placeholder="e.g., 2020"
                                        min="1960"
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expected_graduation_year">Expected Graduation Year</Label>
                                    <Input
                                        id="expected_graduation_year"
                                        type="number"
                                        value={formData.expected_graduation_year}
                                        onChange={(e) => handleInputChange('expected_graduation_year', e.target.value)}
                                        placeholder="e.g., 2024"
                                        min="1960"
                                        max={new Date().getFullYear() + 10}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="course_of_study">Course of Study</Label>
                                    <Input
                                        id="course_of_study"
                                        value={formData.course_of_study}
                                        onChange={(e) => handleInputChange('course_of_study', e.target.value)}
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level_of_study">Level of Study</Label>
                                    <Select value={formData.level_of_study} onValueChange={(value) => handleInputChange('level_of_study', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100">100 Level</SelectItem>
                                            <SelectItem value="200">200 Level</SelectItem>
                                            <SelectItem value="300">300 Level</SelectItem>
                                            <SelectItem value="400">400 Level</SelectItem>
                                            <SelectItem value="500">500 Level</SelectItem>
                                            <SelectItem value="600">600 Level</SelectItem>
                                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                            <SelectItem value="diploma">Diploma</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCurrentTab("personal")}>
                            Back
                        </Button>
                        <Button type="button" onClick={() => setCurrentTab("documents")}>
                            Next: Documents
                        </Button>
                    </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>
                                Upload your verification documents (JPEG, PNG, or PDF - Max 5MB each)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* ID Document */}
                            <DocumentUploadField
                                label="ID Document *"
                                description="Upload your National ID, Voter's Card, Driver's License, or Passport"
                                file={documents.id_document}
                                onChange={(file) => handleFileChange('id_document', file)}
                                required
                            />

                            {/* Student ID Card */}
                            <DocumentUploadField
                                label="Student ID Card"
                                description="Upload your current student ID card"
                                file={documents.student_id_card}
                                onChange={(file) => handleFileChange('student_id_card', file)}
                            />

                            {/* Admission Letter */}
                            <DocumentUploadField
                                label="Admission Letter"
                                description="Upload your admission letter from your institution"
                                file={documents.admission_letter}
                                onChange={(file) => handleFileChange('admission_letter', file)}
                            />

                            {/* School ID Card */}
                            <DocumentUploadField
                                label="School ID Card"
                                description="Upload your school-issued identification card"
                                file={documents.school_id_card}
                                onChange={(file) => handleFileChange('school_id_card', file)}
                            />

                            {/* Current Semester Receipt */}
                            <DocumentUploadField
                                label="Current Semester Receipt"
                                description="Upload your current semester fee payment receipt"
                                file={documents.current_semester_receipt}
                                onChange={(file) => handleFileChange('current_semester_receipt', file)}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCurrentTab("student")}>
                            Back
                        </Button>
                        <Button type="button" onClick={() => setCurrentTab("guardian")}>
                            Next: Guardian Information
                        </Button>
                    </div>
                </TabsContent>

                {/* Guardian Information Tab */}
                <TabsContent value="guardian" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Guardian Information</CardTitle>
                            <CardDescription>
                                Provide your guardian's contact details (Optional but recommended)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="guardian_name">
                                        Guardian Name
                                        <span className="text-muted-foreground ml-1">(Recommended)</span>
                                    </Label>
                                    <Input
                                        id="guardian_name"
                                        value={formData.guardian_name}
                                        onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                                        placeholder="Full name of guardian"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="guardian_phone">
                                        Guardian Phone Number
                                        <span className="text-muted-foreground ml-1">(Recommended)</span>
                                    </Label>
                                    <Input
                                        id="guardian_phone"
                                        type="tel"
                                        value={formData.guardian_phone}
                                        onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                                        placeholder="+234 XXX XXX XXXX"
                                        className={guardianPhoneError ? "border-red-500" : ""}
                                    />
                                    {guardianPhoneError && (
                                        <div className="flex items-center text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {guardianPhoneError}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="guardian_relationship">
                                        Relationship
                                        <span className="text-muted-foreground ml-1">(Recommended)</span>
                                    </Label>
                                    <Select
                                        value={formData.guardian_relationship}
                                        onValueChange={(value) => handleInputChange('guardian_relationship', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="parent">Parent</SelectItem>
                                            <SelectItem value="father">Father</SelectItem>
                                            <SelectItem value="mother">Mother</SelectItem>
                                            <SelectItem value="guardian">Legal Guardian</SelectItem>
                                            <SelectItem value="sibling">Sibling</SelectItem>
                                            <SelectItem value="uncle">Uncle</SelectItem>
                                            <SelectItem value="aunt">Aunt</SelectItem>
                                            <SelectItem value="grandparent">Grandparent</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guardian_address">
                                    Guardian Address
                                    <span className="text-muted-foreground ml-1">(Recommended)</span>
                                </Label>
                                <Textarea
                                    id="guardian_address"
                                    value={formData.guardian_address}
                                    onChange={(e) => handleInputChange('guardian_address', e.target.value)}
                                    placeholder="Guardian's residential address"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCurrentTab("documents")}>
                            Back
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update KYC" : "Submit KYC")}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    );
}
