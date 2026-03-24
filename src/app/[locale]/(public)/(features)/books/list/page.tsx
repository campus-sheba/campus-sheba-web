"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { GoTag } from "react-icons/go";
import { FaRegClock, FaFlask, FaBookOpen } from "react-icons/fa6";
import { BsBook, BsQuestionCircle } from "react-icons/bs";
import { MdMenuBook } from "react-icons/md";
import { BiSolidFileBlank } from "react-icons/bi";
import { LiaFileInvoiceSolid } from "react-icons/lia";

const CATEGORIES = [
  { name: "Textbook", icon: <MdMenuBook /> },
  { name: "Notebook", icon: <BiSolidFileBlank /> },
  { name: "Reference", icon: <LiaFileInvoiceSolid /> },
  { name: "Novel", icon: <BsBook /> },
  { name: "Lab Manual", icon: <FaFlask /> },
  { name: "Study Guide", icon: <FaBookOpen /> },
  { name: "Question Bank", icon: <BsQuestionCircle /> },
  { name: "Other", icon: <GoTag /> },
];
const CONDITIONS = ["New", "Like New", "Good", "Acceptable"];
const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Chemistry",
  "Physics",
  "Mathematics",
];

export default function ListBookPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    listingType: "Sell" as "Sell" | "Rent",
    title: "",
    author: "",
    subject: "",
    category: "Textbook",
    condition: "Good",
    description: "",
    sellingPrice: "",
    originalPrice: "",
    rentalPrice: "",
    department: "",
    semester: "",
    location: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Book title is required";
    if (!formData.author.trim()) newErrors.author = "Author name is required";
    if (!formData.subject.trim())
      newErrors.subject = "Subject/Department is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.contactName.trim())
      newErrors.contactName = "Your name is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Phone number is required";
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Email is required";

    if (formData.listingType === "Sell") {
      if (!formData.sellingPrice)
        newErrors.sellingPrice = "Selling price is required";
    } else {
      if (!formData.rentalPrice)
        newErrors.rentalPrice = "Rental price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-semibold">List Book</h1>
            </div>
          </div>

          {/* Success Message */}
          <div className="p-4">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Listing Created Successfully!
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Your book listing has been published and will appear in the
                Books Exchange shortly.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href={`/books`}
                  className="bg-red-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-red-700 transition-colors"
                >
                  View All Books
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      listingType: "Sell",
                      title: "",
                      author: "",
                      subject: "",
                      category: "Textbook",
                      condition: "Good",
                      description: "",
                      sellingPrice: "",
                      originalPrice: "",
                      rentalPrice: "",
                      department: "",
                      semester: "",
                      location: "",
                      contactName: "",
                      contactPhone: "",
                      contactEmail: "",
                    });
                  }}
                  className="border border-red-600 text-red-600 rounded-xl px-6 py-3 font-semibold hover:bg-red-50 transition-colors"
                >
                  List Another Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white  sticky top-0 z-10">
        <div className=" mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">List Your Book</h1>
        </div>
      </div>

      {/* Form */}
      <div className=" mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4 pb-8">
          {/* Info Box */}
          <div className="bg-gray-50 rounded-lg p-4 flex gap-3">
            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Create Listing
              </p>
              <p className="text-gray-800 text-xs mt-1">
                Provide accurate details for better visibility
              </p>
            </div>
          </div>

          {/* Listing Type */}
          <label className="block font-semibold text-gray-900 mb-2 mt-4">
            Listing Type *
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex gap-4">
              {(["Sell", "Rent"] as const).map((type) => (
                <label
                  key={type}
                  className="flex items-center justify-center flex-1 cursor-pointer"
                >
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, listingType: type }))
                    }
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 ${
                      formData.listingType === type
                        ? "text-red-600 border-2 font-semibold border-red-600 bg-red-100"
                        : "text-gray-700 border-gray-300 bg-gray-200"
                    }`}
                  >
                    {type === "Sell" ? <GoTag /> : <FaRegClock />}
                    <span>{type}</span>
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Book Details */}
          <div className="">
            <h3 className="font-semibold text-gray-900 mb-3 mt-6">
              Book Details
            </h3>
            <div className="space-y-3 border p-4 bg-gray-50 rounded-lg border-gray-200">
              {/* Title */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Data Structures and Algorithms"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none ${errors.title ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="e.g., Michael T. Goodrich"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none ${errors.author ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.author && (
                  <p className="text-red-500 text-xs mt-1">{errors.author}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Subject/Department *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Data Structures"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none ${errors.subject ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-3 mt-5">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            category: cat.name,
                          }))
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                          isSelected
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-3 mt-5">
                  Condition *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((cond) => {
                    const isSelected = formData.condition === cond;
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            condition: cond,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                          isSelected
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-3 mt-5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the book condition, any markings, etc."
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none resize-none ${errors.description ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="space-y-3 border border-gray-200 p-4 rounded-lg ">
              {formData.listingType === "Sell" ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                      Selling Price *
                    </label>

                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full px-4 py-2.5 rounded-lg border outline-none bg-gray-50 ${
                        errors.sellingPrice
                          ? "border-red-500"
                          : "border-gray-200"
                      } text-sm`}
                    />

                    {errors.sellingPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sellingPrice}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                      Original Price (Optional)
                    </label>

                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 outline-none text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                    Rental Price (per month) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">৳</span>
                    <input
                      type="number"
                      name="rentalPrice"
                      value={formData.rentalPrice}
                      onChange={handleChange}
                      placeholder="0"
                      className={`flex-1 px-4 py-2.5 rounded-lg border outline-none ${errors.rentalPrice ? "border-red-500" : "border-gray-200"} text-sm`}
                    />
                  </div>
                  {errors.rentalPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.rentalPrice}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="">
            <h3 className="font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="space-y-3  rounded-lg p-4 border border-gray-200">
              {/* Department */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none text-sm bg-gray-100 ${errors.department ? "border-red-500" : "border-gray-200"}`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Semester
                </label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Semester"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none text-sm bg-gray-100"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Dhaka University"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-gray-100 outline-none ${errors.location ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="">
            <h3 className="font-semibold text-gray-900 mb-3 mt-5">
              Contact Information
            </h3>
            <div className="space-y-3 rounded-lg p-4 border border-gray-200">
              {/* Your Name */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none bg-gray-100 ${errors.contactName ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.contactName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none bg-gray-100 ${errors.contactPhone ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.contactPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactPhone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs md:text-sm text-gray-900 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none bg-gray-100 ${errors.contactEmail ? "border-red-500" : "border-gray-200"} text-sm`}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex mt-5">
            <button
              type="submit"
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors w-full md:w-auto"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
