import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  FileText,
  Upload,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { courierService } from "@/services/courierService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DocumentType =
  | "company_registration"
  | "company_pan_vat"
  | "company_additional";

interface DocumentUpload {
  id: string;
  document_type: DocumentType;
  document_number: string;
  uploaded_file: File | null;
  fileName: string;
}

interface FormData {
  name: string;
  company_email: string;
  company_phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function CourierRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    company_email: "",
    company_phone: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nepal",
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    {
      id: "1",
      document_type: "company_pan_vat",
      document_number: "",
      uploaded_file: null,
      fileName: "",
    },
    {
      id: "2",
      document_type: "company_registration",
      document_number: "",
      uploaded_file: null,
      fileName: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setSubmitError(
          "File size cannot exceed 5MB. Please choose a smaller file.",
        );
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError("Only PDF, JPEG, and PNG files are allowed.");
        return;
      }

      // Clear any previous errors
      setSubmitError(null);
    }

    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === id
          ? { ...doc, uploaded_file: file, fileName: file?.name || "" }
          : doc,
      ),
    );
  };

  const handleDocumentNumberChange = (id: string, value: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === id ? { ...doc, document_number: value } : doc,
      ),
    );
  };

  const addDocument = () => {
    const newId = (documents.length + 1).toString();
    setDocuments([
      ...documents,
      {
        id: newId,
        document_type: "company_additional",
        document_number: "",
        uploaded_file: null,
        fileName: "",
      },
    ]);
  };

  const removeDocument = (id: string) => {
    // Only allow removing additional documents (id > 2)
    if (documents.length > 2 && id !== "1" && id !== "2") {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
    }
  };

  const validateForm = (): string | null => {
    // Check basic fields
    if (!formData.name.trim()) return "Company name is required";
    if (!formData.company_email.trim()) return "Company email is required";
    if (!formData.company_phone.trim()) return "Phone number is required";
    if (!formData.address_line.trim()) return "Address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State/Province is required";
    if (!formData.postal_code.trim()) return "Postal code is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.company_email)) {
      return "Please enter a valid email address";
    }

    // Check first two required documents
    const panVatDoc = documents.find((doc) => doc.id === "1");
    const companyRegDoc = documents.find((doc) => doc.id === "2");

    if (!panVatDoc?.uploaded_file) {
      return "PAN/VAT document file is required";
    }
    if (!panVatDoc?.document_number.trim()) {
      return "PAN/VAT document number is required";
    }

    if (!companyRegDoc?.uploaded_file) {
      return "Company Registration document file is required";
    }
    if (!companyRegDoc?.document_number.trim()) {
      return "Company Registration document number is required";
    }

    // Check additional documents (if any) - only file is required, number is optional
    for (const doc of documents.slice(2)) {
      if (!doc.uploaded_file && doc.document_number.trim()) {
        return "Please upload file for the document with number provided";
      }
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare documents data
      const documentsData = documents
        .filter((doc) => doc.uploaded_file !== null)
        .map((doc) => ({
          document_type: doc.document_type,
          document_number: doc.document_number,
          uploaded_file: doc.uploaded_file!,
        }));

      // Submit registration
      const response = await courierService.registerCourier({
        ...formData,
        documents: documentsData,
      });

      if (response.IsSuccess) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: "",
          company_email: "",
          company_phone: "",
          address_line: "",
          city: "",
          state: "",
          postal_code: "",
          country: "Nepal",
        });
        setDocuments([
          {
            id: "1",
            document_type: "company_pan_vat",
            document_number: "",
            uploaded_file: null,
            fileName: "",
          },
          {
            id: "2",
            document_type: "company_registration",
            document_number: "",
            uploaded_file: null,
            fileName: "",
          },
        ]);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Handle error message which can be a string or object
        if (typeof response.ErrorMessage === "string") {
          setSubmitError(response.ErrorMessage);
        } else if (
          response.ErrorMessage &&
          typeof response.ErrorMessage === "object"
        ) {
          // Extract first error message from object
          const firstKey = Object.keys(response.ErrorMessage)[0];
          const firstError = response.ErrorMessage[firstKey];
          setSubmitError(
            Array.isArray(firstError) ? firstError[0] : firstError,
          );
        } else {
          setSubmitError(
            "Registration failed. Please check your information and try again.",
          );
        }
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle API error response
      if (error.response?.data?.ErrorMessage) {
        const errMsg = error.response.data.ErrorMessage;
        if (typeof errMsg === "string") {
          setSubmitError(errMsg);
        } else if (typeof errMsg === "object") {
          const firstKey = Object.keys(errMsg)[0];
          const firstError = errMsg[firstKey];
          setSubmitError(
            Array.isArray(firstError) ? firstError[0] : firstError,
          );
        } else {
          setSubmitError(
            "An error occurred during registration. Please try again.",
          );
        }
      } else {
        setSubmitError(
          error.response?.data?.message ||
            "An error occurred during registration. Please try again.",
        );
      }
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-4xl space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200/60 my-auto">
            <div className="space-y-6">
              <BrandLogo className="h-14 w-auto" alt="Door2Door" />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  Courier Staff Registration
                </h1>
                <p className="text-sm text-slate-600">
                  Register your courier company and upload required documents.
                  Your team login credentials will be issued after verification.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
                <Building2 className="h-4 w-4" />
                New courier onboarding
              </div>
            </div>

            {submitSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Registration Submitted Successfully!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Your courier provider registration has been submitted
                  successfully. Your application is under review. You will
                  receive an email with login credentials once approved.
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Registration Failed
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 pb-8">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle>Company Information</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your company&apos;s basic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Company Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter company name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_email">
                        Company Email{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="company_email"
                        type="email"
                        placeholder="company@example.com"
                        value={formData.company_email}
                        onChange={(e) =>
                          handleInputChange("company_email", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company_phone"
                      type="tel"
                      placeholder="+977-XXXXXXXXXX"
                      value={formData.company_phone}
                      onChange={(e) =>
                        handleInputChange("company_phone", e.target.value)
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle>Address Details</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your company&apos;s registered address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_line">
                      Address Line <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address_line"
                      placeholder="Street address, building, floor"
                      value={formData.address_line}
                      onChange={(e) =>
                        handleInputChange("address_line", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        State/Province{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          handleInputChange("state", value)
                        }
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Koshi">Koshi Province</SelectItem>
                          <SelectItem value="Madhesh">
                            Madhesh Province
                          </SelectItem>
                          <SelectItem value="Bagmati">
                            Bagmati Province
                          </SelectItem>
                          <SelectItem value="Gandaki">
                            Gandaki Province
                          </SelectItem>
                          <SelectItem value="Lumbini">
                            Lumbini Province
                          </SelectItem>
                          <SelectItem value="Karnali">
                            Karnali Province
                          </SelectItem>
                          <SelectItem value="Sudurpashchim">
                            Sudurpashchim Province
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">
                        Postal Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postal_code"
                        placeholder="Enter postal code"
                        value={formData.postal_code}
                        onChange={(e) =>
                          handleInputChange("postal_code", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle>Document Upload</CardTitle>
                  </div>
                  <CardDescription>
                    Upload your company registration documents and PAN/VAT
                    certificate (both required)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="space-y-4 rounded-lg border border-slate-200 bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {doc.id === "1"
                            ? "PAN/VAT Certificate"
                            : doc.id === "2"
                              ? "Company Registration"
                              : `Additional Document ${index - 1}`}
                          {(doc.id === "1" || doc.id === "2") && (
                            <span className="ml-1 text-destructive">*</span>
                          )}
                        </h3>
                        {doc.id !== "1" && doc.id !== "2" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {doc.id === "1" || doc.id === "2" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`docNumber-${doc.id}`}>
                                Document Number{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`docNumber-${doc.id}`}
                                placeholder="Enter document number"
                                value={doc.document_number}
                                onChange={(e) =>
                                  handleDocumentNumberChange(
                                    doc.id,
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`docUpload-${doc.id}`}>
                                Upload Document{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  key={`file-${doc.id}`}
                                  id={`docUpload-${doc.id}`}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileChange(
                                      doc.id,
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`docUpload-${doc.id}`}
                                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors hover:bg-accent"
                                >
                                  {doc.fileName ? (
                                    <>
                                      <FileText className="w-4 h-4 text-primary" />
                                      <span className="truncate text-primary">
                                        {doc.fileName}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        Choose file (PDF, JPG, PNG - Max 5MB)
                                      </span>
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor={`docUpload-${doc.id}`}>
                              Upload Document
                            </Label>
                            <div className="relative">
                              <Input
                                key={`file-${doc.id}`}
                                id={`docUpload-${doc.id}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  handleFileChange(
                                    doc.id,
                                    e.target.files?.[0] || null,
                                  )
                                }
                                className="hidden"
                              />
                              <label
                                htmlFor={`docUpload-${doc.id}`}
                                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors hover:bg-accent"
                              >
                                {doc.fileName ? (
                                  <>
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="truncate text-primary">
                                      {doc.fileName}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Choose file (PDF, JPG, PNG - Max 5MB)
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDocument}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Document
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/courier/login")}
                  className="sm:w-auto"
                >
                  Already registered? Sign in
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </div>
            </form>
      </div>
    </div>
  );
}
