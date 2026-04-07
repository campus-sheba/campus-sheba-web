export interface ShopCreateMessages {
  intro: {
    badge: string;
    title: string;
    description: string;
    createButton: string;
    moderationNote: string;
    facilitiesTitle: string[];
    facilitiesDescription: string[];
    beforeTitle: string;
    guidelines: string[];
    continueButton: string;
  };
  form: {
    backToIntro: string;
    heroBadge: string;
    heroTitle: string;
    heroDescription: string;
    currentStep: string;
    steps: string[];
    loadingCategories: string;
    selectCategory: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    labels: {
      category: string;
      shopType: string;
      shopName: string;
      description: string;
      subCategories: string;
      address: string;
      contactEmail: string;
      phoneNumber: string;
      website: string;
      minimumOrderAmount: string;
      facebook: string;
      instagram: string;
      twitter: string;
      whatsapp: string;
      latitude: string;
      longitude: string;
      tags: string;
      logoUpload: string;
      coverUpload: string;
    };
    notes: {
      categorySpecific: string;
      payloadStrategyTitle: string;
      payloadStrategyBody: string;
    };
    buttons: {
      back: string;
      next: string;
      submit: string;
      submitting: string;
      createAnother: string;
      goMarketplace: string;
      addSlot: string;
    };
    success: {
      title: string;
      defaultMessage: string;
      pendingMessage: string;
      advancedSavedMessage: string;
    };
    errors: {
      requiredAllSections: string;
      categoriesLoad: string;
      createFail: string;
    };
  };
}

const en: ShopCreateMessages = {
  intro: {
    badge: "Student Entrepreneurship",
    title: "Build Your Campus Shop With Confidence",
    description:
      "Start with clear guidance, choose your business model, and launch a professional shop profile designed for student buyers.",
    createButton: "Create A Shop",
    moderationNote: "Moderation review in under 24 hours",
    facilitiesTitle: ["Campus Visibility", "Secure Moderation", "Scalable Shop Types"],
    facilitiesDescription: [
      "Get discovered by students and staff searching for trusted campus-first sellers.",
      "Each new shop is reviewed for quality, safety, and policy compliance before going live.",
      "Start with one category and expand with food, products, services, or logistics workflows.",
    ],
    beforeTitle: "Before You Create",
    guidelines: [
      "Use a clear, original shop name and complete your branding fields.",
      "Add valid contact details so buyers can reach you quickly.",
      "Define real operating hours and practical delivery or service policies.",
      "Use category-specific settings to match how your shop actually works.",
    ],
    continueButton: "Continue To Dynamic Form",
  },
  form: {
    backToIntro: "Back To Introduction",
    heroBadge: "Dynamic Shop Creator",
    heroTitle: "Setup Your Student Shop",
    heroDescription:
      "One base form with dynamic policy blocks based on category. Configure your profile once, then specialize for food, product, service, or logistics operations.",
    currentStep: "Current Step",
    steps: ["Base Details", "Contact & Media", "Dynamic Policies", "Review & Submit"],
    loadingCategories: "Loading categories...",
    selectCategory: "Select category",
    step1Title: "Base Shop Details",
    step2Title: "Contact, Brand, And Operations",
    step3Title: "Dynamic Policy Blocks",
    step4Title: "Review And Submit",
    labels: {
      category: "Category",
      shopType: "Shop Type",
      shopName: "Shop Name",
      description: "Description",
      subCategories: "Sub Categories",
      address: "Address",
      contactEmail: "Contact Email",
      phoneNumber: "Phone Number",
      website: "Website",
      minimumOrderAmount: "Minimum Order Amount",
      facebook: "Facebook Link",
      instagram: "Instagram Link",
      twitter: "Twitter Link",
      whatsapp: "WhatsApp Link",
      latitude: "Latitude",
      longitude: "Longitude",
      tags: "Tags (comma separated)",
      logoUpload: "Upload Logo",
      coverUpload: "Upload Cover Photo",
    },
    notes: {
      categorySpecific: "Category-specific note",
      payloadStrategyTitle: "Payload strategy in use",
      payloadStrategyBody:
        "Backend-supported fields are submitted to the owner shop API. Dynamic connector and advanced policy blocks are preserved locally until dedicated backend endpoints are available.",
    },
    buttons: {
      back: "Back",
      next: "Next",
      submit: "Submit Shop",
      submitting: "Submitting...",
      createAnother: "Create Another Shop",
      goMarketplace: "Go To Marketplace",
      addSlot: "Add slot",
    },
    success: {
      title: "Shop Submitted Successfully",
      defaultMessage: "Your shop is now under review. Approval updates will be available shortly.",
      pendingMessage: "Shop created successfully and sent for moderation review.",
      advancedSavedMessage:
        "Shop created. Advanced connector/policy settings were saved locally for upcoming API support.",
    },
    errors: {
      requiredAllSections: "Please complete required fields in all sections before submission.",
      categoriesLoad: "Unable to load categories.",
      createFail: "Shop creation failed. Please try again.",
    },
  },
};

const bn: ShopCreateMessages = {
  intro: {
    badge: "শিক্ষার্থী উদ্যোক্তা",
    title: "আত্মবিশ্বাসের সাথে আপনার ক্যাম্পাস শপ শুরু করুন",
    description:
      "সুস্পষ্ট নির্দেশনা দিয়ে শুরু করুন, আপনার ব্যবসার ধরন বেছে নিন এবং শিক্ষার্থীদের জন্য পেশাদার শপ প্রোফাইল চালু করুন।",
    createButton: "শপ তৈরি করুন",
    moderationNote: "২৪ ঘণ্টার মধ্যে মডারেশন রিভিউ",
    facilitiesTitle: ["ক্যাম্পাস ভিজিবিলিটি", "নিরাপদ মডারেশন", "স্কেলেবল শপ টাইপ"],
    facilitiesDescription: [
      "বিশ্বস্ত ক্যাম্পাস বিক্রেতা খুঁজছেন এমন শিক্ষার্থী ও স্টাফদের কাছে সহজে পৌঁছান।",
      "লাইভ হওয়ার আগে প্রতিটি নতুন শপ গুণগত মান, নিরাপত্তা ও নীতিমালা অনুযায়ী রিভিউ করা হয়।",
      "একটি ক্যাটাগরি দিয়ে শুরু করে ফুড, প্রোডাক্ট, সার্ভিস বা লজিস্টিকসে বাড়ান।",
    ],
    beforeTitle: "তৈরির আগে",
    guidelines: [
      "পরিষ্কার ও ইউনিক শপ নাম ব্যবহার করুন এবং ব্র্যান্ডিং তথ্য পূরণ করুন।",
      "সঠিক যোগাযোগ তথ্য দিন যাতে ক্রেতারা দ্রুত যোগাযোগ করতে পারে।",
      "বাস্তবসম্মত অপারেটিং আওয়ার ও ডেলিভারি/সার্ভিস পলিসি নির্ধারণ করুন।",
      "আপনার শপের ধরন অনুযায়ী ক্যাটাগরি-ভিত্তিক সেটিংস দিন।",
    ],
    continueButton: "ডাইনামিক ফর্মে যান",
  },
  form: {
    backToIntro: "ভূমিকায় ফিরে যান",
    heroBadge: "ডাইনামিক শপ ক্রিয়েটর",
    heroTitle: "আপনার স্টুডেন্ট শপ সেটআপ করুন",
    heroDescription:
      "একটি বেস ফর্মের সাথে ক্যাটাগরি অনুযায়ী ডাইনামিক পলিসি ব্লক। একবার প্রোফাইল সেট করুন, তারপর ফুড, প্রোডাক্ট, সার্ভিস বা লজিস্টিকস অনুযায়ী কাস্টমাইজ করুন।",
    currentStep: "বর্তমান ধাপ",
    steps: ["বেস তথ্য", "যোগাযোগ ও মিডিয়া", "ডাইনামিক পলিসি", "রিভিউ ও সাবমিট"],
    loadingCategories: "ক্যাটাগরি লোড হচ্ছে...",
    selectCategory: "ক্যাটাগরি নির্বাচন করুন",
    step1Title: "বেস শপ তথ্য",
    step2Title: "যোগাযোগ, ব্র্যান্ড ও অপারেশন",
    step3Title: "ডাইনামিক পলিসি ব্লক",
    step4Title: "রিভিউ ও সাবমিট",
    labels: {
      category: "ক্যাটাগরি",
      shopType: "শপ টাইপ",
      shopName: "শপ নাম",
      description: "বর্ণনা",
      subCategories: "সাব ক্যাটাগরি",
      address: "ঠিকানা",
      contactEmail: "কনট্যাক্ট ইমেইল",
      phoneNumber: "ফোন নম্বর",
      website: "ওয়েবসাইট",
      minimumOrderAmount: "সর্বনিম্ন অর্ডার",
      facebook: "ফেসবুক লিংক",
      instagram: "ইনস্টাগ্রাম লিংক",
      twitter: "টুইটার লিংক",
      whatsapp: "হোয়াটসঅ্যাপ লিংক",
      latitude: "অক্ষাংশ",
      longitude: "দ্রাঘিমাংশ",
      tags: "ট্যাগ (কমা দিয়ে)",
      logoUpload: "লোগো আপলোড",
      coverUpload: "কভার ছবি আপলোড",
    },
    notes: {
      categorySpecific: "ক্যাটাগরি-ভিত্তিক নোট",
      payloadStrategyTitle: "ব্যবহৃত পে-লোড কৌশল",
      payloadStrategyBody:
        "ব্যাকএন্ড-সমর্থিত ফিল্ডগুলো শপ API-তে সাবমিট করা হয়। ডাইনামিক কানেক্টর ও উন্নত পলিসি ফিল্ড আপাতত লোকালি সংরক্ষণ করা হয়।",
    },
    buttons: {
      back: "পেছনে",
      next: "পরবর্তী",
      submit: "শপ সাবমিট করুন",
      submitting: "সাবমিট হচ্ছে...",
      createAnother: "আরেকটি শপ তৈরি করুন",
      goMarketplace: "মার্কেটপ্লেসে যান",
      addSlot: "স্লট যোগ করুন",
    },
    success: {
      title: "শপ সফলভাবে সাবমিট হয়েছে",
      defaultMessage: "আপনার শপ এখন রিভিউতে আছে। খুব শিগগিরই আপডেট পাবেন।",
      pendingMessage: "শপ সফলভাবে তৈরি হয়েছে এবং রিভিউয়ের জন্য পাঠানো হয়েছে।",
      advancedSavedMessage:
        "শপ তৈরি হয়েছে। উন্নত কানেক্টর/পলিসি সেটিংস ভবিষ্যৎ API সাপোর্টের জন্য লোকালি সংরক্ষিত হয়েছে।",
    },
    errors: {
      requiredAllSections: "সাবমিটের আগে সব প্রয়োজনীয় তথ্য পূরণ করুন।",
      categoriesLoad: "ক্যাটাগরি লোড করা যায়নি।",
      createFail: "শপ তৈরি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    },
  },
};

export function getShopCreateMessages(locale: string): ShopCreateMessages {
  return locale === "bn" ? bn : en;
}
