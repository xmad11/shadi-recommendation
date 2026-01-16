/* ═══════════════════════════════════════════════════════════════════════════════
   TRANSLATIONS - Bilingual support for Arabic and English
   ═══════════════════════════════════════════════════════════════════════════════ */

import type { Language } from "./language.types"

export type TranslationKey = keyof typeof translations.ar

export const translations = {
  ar: {
    // Admin Dashboard
    adminDashboard: "لوحة التحكم",
    addRestaurant: "إضافة مطعم",

    // Form labels
    restaurantName: "اسم المطعم",
    restaurantNameRequired: "اسم المطعم *",
    emirate: "الإمارة",
    mealType: "نوع الوجبة",
    cuisine: "المطبخ",
    cuisineRequired: "المطبخ *",
    atmosphere: "الجو",
    priceRange: "نطاق السعر (درهم)",
    district: "المنطقة",
    fullAddress: "العنوان الكامل",
    description: "الوصف",
    contactSocial: "جهات الاتصال ووسائل التواصل",
    restaurantImages: "صور المطعم",

    // Buttons
    addPhoto: "إضافة صورة",
    addContact: "إضافة جهة اتصال",
    addRestaurantButton: "إضافة مطعم",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",

    // Placeholders
    restaurantNamePlaceholder: "اسم المطعم",
    districtPlaceholder: "مثل: وسط المدينة، مارينا",
    addressPlaceholder: "المبنى، الشارع، المنطقة",
    descriptionPlaceholder: "وصف المطعم",
    selectMealType: "اختر نوع الوجبة",
    selectCuisine: "اختر المطبخ",
    selectAtmosphere: "اختر الجو",

    // Error messages
    errorNameAndCuisineRequired: "يرجى ملء اسم المطعم والمطبخ على الأقل",

    // Delete confirmation
    deleteConfirmation: "تأكيد الحذف",
    deleteConfirmMessage: "هل أنت متأكد من أنك تريد حذف هذا المطعم؟ لا يمكن التراجع عن هذا الإجراء.",
    yesDelete: "نعم، احذف",
    noRestaurantsFound: "لم يتم العثور على مطاعم",

    // Contact types
    contactPhone: "هاتف",
    contactWebsite: "موقع إلكتروني",
    contactInstagram: "انستغرام",
    contactFacebook: "فيسبوك",
    contactTwitter: "إكس (تويتر)",
    contactTiktok: "تيك توك",
    contactTalabat: "طلبات",
    contactNoon: "نون فوود",
    contactDeliveroo: "ديليرو",
    contactCareem: "كريم ناو",
    contactUberEats: "أوبر إيتس",
    contactZomato: "زوماتو",

    // Contact placeholders
    contactPhonePlaceholder: "+971 50 123 4567",
    contactWebsitePlaceholder: "https://restaurant.com",
    contactSocialPlaceholder: "@restaurant",
    contactOrderPlaceholder: "رابط الطلب",

    // View modes
    viewListView: "عرض القائمة",
    view1Column: "عمود واحد",
    view2Columns: "عمودان",
    view3Columns: "ثلاثة أعمدة",
    view4Columns: "أربعة أعمدة",

    // Sort options
    sortNewestFirst: "الأحدث أولاً",
    sortOldestFirst: "الأقدم أولاً",
    sortPriceLowToHigh: "السعر: من الأقل للأعلى",
    sortPriceHighToLow: "السعر: من الأعلى للأقل",

    // Results
    restaurantsCount: "مطاعم",

    // Common
    main: "الرئيسية",
  } as const,

  en: {
    // Admin Dashboard
    adminDashboard: "Admin Dashboard",
    addRestaurant: "Add Restaurant",

    // Form labels
    restaurantName: "Restaurant Name",
    restaurantNameRequired: "Restaurant Name *",
    emirate: "Emirate",
    mealType: "Meal Type",
    cuisine: "Cuisine",
    cuisineRequired: "Cuisine *",
    atmosphere: "Atmosphere",
    priceRange: "Price Range (AED)",
    district: "District",
    fullAddress: "Full Address",
    description: "Description",
    contactSocial: "Contact & Social",
    restaurantImages: "Restaurant Images",

    // Buttons
    addPhoto: "Add Photo",
    addContact: "Add Contact",
    addRestaurantButton: "Add Restaurant",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",

    // Placeholders
    restaurantNamePlaceholder: "Restaurant name",
    districtPlaceholder: "e.g., Downtown, Marina",
    addressPlaceholder: "Building, street, area",
    descriptionPlaceholder: "Restaurant description",
    selectMealType: "Select meal type",
    selectCuisine: "Select cuisine",
    selectAtmosphere: "Select atmosphere",

    // Error messages
    errorNameAndCuisineRequired: "Please enter restaurant name and at least one cuisine",

    // Delete confirmation
    deleteConfirmation: "Confirm Delete",
    deleteConfirmMessage: "Are you sure you want to delete this restaurant? This action cannot be undone.",
    yesDelete: "Yes, delete",
    noRestaurantsFound: "No restaurants found",

    // Contact types
    contactPhone: "Phone",
    contactWebsite: "Website",
    contactInstagram: "Instagram",
    contactFacebook: "Facebook",
    contactTwitter: "X (Twitter)",
    contactTiktok: "TikTok",
    contactTalabat: "Talabat",
    contactNoon: "Noon Food",
    contactDeliveroo: "Deliveroo",
    contactCareem: "Careem NOW",
    contactUberEats: "Uber Eats",
    contactZomato: "Zomato",

    // Contact placeholders
    contactPhonePlaceholder: "+971 50 123 4567",
    contactWebsitePlaceholder: "https://restaurant.com",
    contactSocialPlaceholder: "@restaurant",
    contactOrderPlaceholder: "Order link",

    // View modes
    viewListView: "List View",
    view1Column: "1 Column",
    view2Columns: "2 Columns",
    view3Columns: "3 Columns",
    view4Columns: "4 Columns",

    // Sort options
    sortNewestFirst: "Newest First",
    sortOldestFirst: "Oldest First",
    sortPriceLowToHigh: "Price: Low to High",
    sortPriceHighToLow: "Price: High to Low",

    // Results
    restaurantsCount: "restaurants",

    // Common
    main: "Main",
  } as const,
} as const

/**
 * Get a translation by key and language
 */
export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.en[key] || key
}

/**
 * Hook for using translations (to be used in client components)
 * This should be used alongside useLanguage() hook
 */
export function useTranslations(lang: Language) {
  return {
    t: (key: TranslationKey) => t(key, lang),
  }
}
