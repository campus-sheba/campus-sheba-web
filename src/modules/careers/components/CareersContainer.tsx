/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { JSX } from "react/jsx-runtime";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  UploadCloud,
} from "lucide-react";
import { getPublic } from "@/utils/api/get";
import { postPublic } from "@/utils/api/post";
import { careersEndpoints } from "@/utils/endpoints/endpoints";

// Types and Interfaces
interface University {
  id: string;
  name: string;
}

interface JobType {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

interface FormData {
  type: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  cv: File | null;
}

interface FormErrors {
  type?: string;
  name?: string;
  email?: string;
  phone?: string;
  university?: string;
  cv?: string;
}

interface SubmitStatus {
  status: 'success' | 'error' | '';
  message: string;
}

// Job types with their descriptions
const JOB_TYPES: JobType[] = [
  {
    id: "CAMPUS_AMBASSADOR",
    title: "Campus Ambassador",
    description:
      "Represent our company on campus and help spread awareness about our products and services among students.",
    icon: <GraduationCap className="h-6 w-6 text-red-500 md:h-8 md:w-8" />,
  },
];

const CareersContainer: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'jobs' | 'application'>('jobs');
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    name: '',
    email: '',
    phone: '',
    university: '',
    cv: null,
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ status: "", message: "" });
  const [cvPreview, setCvPreview] = useState<string | null>(null);

  // Fetch universities when component mounts
  useEffect(() => {
    const fetchUniversities = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = (await getPublic(careersEndpoints.universities)) as { data: University[] };
        setUniversities(response.data);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];

      if (file.type !== 'application/pdf') {
        setFormErrors(prev => ({
          ...prev,
          cv: 'Only PDF files are accepted',
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setFormErrors(prev => ({
          ...prev,
          cv: 'File size should not exceed 5MB',
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        cv: file,
      }));

      setCvPreview(file.name);

      // Clear error for this field
      if (formErrors.cv) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cv;
          return newErrors;
        });
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.type) errors.type = 'Job type is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.university) errors.university = 'University is required';
    if (!formData.cv) errors.cv = 'CV is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitStatus({ status: "", message: "" });

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      // Send form data to API
      const response: any = await postPublic(
        careersEndpoints.sendApplication,
        formDataToSend
      );

      setSubmitStatus({
        status: "success",
        message: response.data.message || "Email sent successfully",
      });

      // Optional: Reset form after success
      resetForm();
    } catch (error) {
      // Handle API error
      setSubmitStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to submit form",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form data and related states
  const resetForm = (): void => {
    setFormData({
      type: "",
      name: "",
      email: "",
      phone: "",
      university: "",
      cv: null,
    });
    setFormErrors({});
    setCvPreview(null);
  };

  // Select a job and go to application form
  const selectJob = (jobType: JobType): void => {
    setSelectedJobType(jobType);
    setFormData(prev => ({
      ...prev,
      type: jobType.id,
    }));
    setActiveTab("application");
    // Scroll to top of page
    window.scrollTo(0, 0);
  };

  // Go back to job listings
  const goBackToJobs = (): void => {
    setActiveTab("jobs");
    setSubmitStatus({ status: "", message: "" });
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8 md:py-24">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-lg py-8 ps-3 text-white shadow-lg md:py-10 md:ps-5"
        style={{
          background: "linear-gradient(90deg, #7D060A 0%, #e30b12 100%)",
        }}
      >
        {/* Subtle background patterns */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />

        {/* Light beam effect */}
        <div
          className="absolute top-0 right-0 h-full w-1/3 translate-x-1/4 translate-y-1/4 rotate-12 transform opacity-20"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, #ffffff 100%)',
          }}
        />

        {/* Subtle overlay gradient */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at right, #ff5b61 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="bg-opacity-50 mb-2 inline-block rounded-full bg-red-800 px-2 py-1 text-xs font-medium text-white md:mb-3 md:text-sm">
              Exciting Opportunities
            </span>
            <h1 className="mb-3 text-3xl leading-tight font-bold md:mb-4 md:text-4xl lg:text-5xl">
              Join Our <span className="italic">Elite</span> Team
            </h1>
            <p className="mb-6 text-sm leading-relaxed font-light opacity-90 md:mb-8 md:text-xl">
              Discover exciting career opportunities and be part of our success story. We&apos;re
              looking for passionate individuals to drive innovation forward.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 h-20 w-20 translate-x-1/4 translate-y-1/4 transform opacity-30 md:h-32 md:w-32">
          <div className="h-full w-full rounded-full border-4 border-white"></div>
        </div>
        <div className="absolute bottom-10 left-1/3 h-10 w-10 -translate-x-1/2 transform opacity-20 md:h-16 md:w-16">
          <div className="h-full w-full rounded-full bg-white"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b md:mb-8">
          <button
            className={`px-4 py-2 text-base font-medium whitespace-nowrap md:px-6 md:py-3 md:text-lg ${
              activeTab === "jobs" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500"
            }`}
            onClick={goBackToJobs}
          >
            Available Positions
          </button>
          {activeTab === "application" && (
            <button
              className={`px-4 py-2 text-base font-medium whitespace-nowrap md:px-6 md:py-3 md:text-lg ${
                activeTab === "application" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500"
              }`}
            >
              Application Form
            </button>
          )}
        </div>

        {/* Job Listings */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {JOB_TYPES.map(job => (
              <div
                key={job.id}
                className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-full flex-col justify-between p-4 md:p-6">
                  <div className="">
                    <div className="flex items-center gap-2">
                      {job.icon}
                      <span className="text-base font-semibold text-gray-800 md:text-lg">
                        {job.title}
                      </span>
                    </div>

                    <p className="my-3 text-sm text-gray-600 md:my-5 md:text-base">
                      {job.description}
                    </p>
                  </div>
                  <button
                    onClick={() => selectJob(job)}
                    className="w-full rounded-md bg-red-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors duration-300 hover:bg-red-700 md:text-base"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Form */}
        {activeTab === "application" && selectedJobType && (
          <div className="rounded-lg bg-white p-4 shadow-md md:p-6 lg:p-8">
            <div className="mb-4 md:mb-6">
              <h2 className="mb-2 text-xl font-bold md:text-2xl">
                Apply for {selectedJobType.title}
              </h2>
              <p className="text-sm text-gray-600 md:text-base">{selectedJobType.description}</p>
            </div>

            {submitStatus.status === "success" ? (
              <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800">
                <p className="font-medium">{submitStatus.message}</p>
                <button
                  onClick={goBackToJobs}
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-red-700"
                >
                  View More Opportunities
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {submitStatus.status === "error" && (
                  <div className="rounded-md bg-red-50 p-4 text-red-800">
                    <p className="font-medium">{submitStatus.message}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label
                      className="mb-1 block text-sm text-gray-700 md:mb-2 md:text-base"
                      htmlFor="name"
                    >
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4 text-red-500 md:mr-2 md:h-5 md:w-5" />
                        <span>Full Name</span>
                        <span className="ml-1 text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border p-2 text-sm md:p-3 md:text-base ${
                        formErrors.name ? "border-red-500" : "border-gray-300"
                      } focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500 md:text-sm">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="mb-1 block text-sm text-gray-700 md:mb-2 md:text-base"
                      htmlFor="email"
                    >
                      <div className="flex items-center">
                        <Mail className="mr-1 h-4 w-4 text-red-500 md:mr-2 md:h-5 md:w-5" />
                        <span>Email Address</span>
                        <span className="ml-1 text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border p-2 text-sm md:p-3 md:text-base ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      } focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500 md:text-sm">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="mb-1 block text-sm text-gray-700 md:mb-2 md:text-base"
                      htmlFor="phone"
                    >
                      <div className="flex items-center">
                        <Phone className="mr-1 h-4 w-4 text-red-500 md:mr-2 md:h-5 md:w-5" />
                        <span>Phone Number</span>
                        <span className="ml-1 text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border p-2 text-sm md:p-3 md:text-base ${
                        formErrors.phone ? "border-red-500" : "border-gray-300"
                      } focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none`}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-500 md:text-sm">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="mb-1 block text-sm text-gray-700 md:mb-2 md:text-base"
                      htmlFor="university"
                    >
                      <div className="flex items-center">
                        <GraduationCap className="mr-1 h-4 w-4 text-red-500 md:mr-2 md:h-5 md:w-5" />
                        <span>University</span>
                        <span className="ml-1 text-red-500">*</span>
                      </div>
                    </label>
                    <select
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border p-2 text-sm md:p-3 md:text-base ${
                        formErrors.university ? "border-red-500" : "border-gray-300"
                      } focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none`}
                      disabled={isLoading || universities.length === 0}
                    >
                      <option value="">Select your university</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.university && (
                      <p className="mt-1 text-xs text-red-500 md:text-sm">
                        {formErrors.university}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1 block text-sm text-gray-700 md:mb-2 md:text-base"
                    htmlFor="cv"
                  >
                    <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-red-500 md:mr-2 md:h-5 md:w-5" />
                      <span>Upload CV (PDF only, max 5MB)</span>
                      <span className="ml-1 text-red-500">*</span>
                    </div>
                  </label>
                  <div
                    className={`rounded-md border-2 border-dashed p-3 md:p-4 ${
                      formErrors.cv ? "border-red-500" : "border-gray-300"
                    } transition-colors duration-300 hover:border-red-400`}
                  >
                    <div className="flex items-center justify-center">
                      {!cvPreview ? (
                        <label
                          htmlFor="cv"
                          className="flex w-full cursor-pointer flex-col items-center justify-center"
                        >
                          <UploadCloud className="mb-1 h-8 w-8 text-red-400 md:mb-2 md:h-10 md:w-10" />
                          <span className="text-xs text-gray-500 md:text-sm">
                            Click to upload or drag and drop
                          </span>
                          <input
                            type="file"
                            id="cv"
                            name="cv"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="mr-1 h-5 w-5 text-red-500 md:mr-2 md:h-6 md:w-6" />
                            <span className="max-w-xs truncate text-xs text-gray-700 md:max-w-md md:text-sm lg:text-base">
                              {cvPreview}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, cv: null }));
                              setCvPreview(null);
                            }}
                            className="text-sm text-red-500 hover:text-red-700 md:text-base"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {formErrors.cv && (
                    <p className="mt-1 text-xs text-red-500 md:text-sm">{formErrors.cv}</p>
                  )}
                </div>

                <div className="mt-4 flex flex-col justify-end space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={goBackToJobs}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors duration-300 hover:bg-gray-50 sm:w-auto md:px-6 md:py-3 md:text-base"
                  >
                    Back to Jobs
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-red-700 sm:w-auto md:px-6 md:py-3 md:text-base"
                  >
                    {isLoading ? <span>Submitting...</span> : <span>Submit Application</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareersContainer;
