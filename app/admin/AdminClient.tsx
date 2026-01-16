"use client"

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react"
import { RestaurantCard } from "@/components/card"
import { FilterSystem, type CuisineOption, type MealOption, type AtmosphereOption } from "@/components/search/FilterSystem"
import { ArrowUpDown, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react"
import { ChevronDown, X } from "lucide-react"
import { CardCarousel } from "@/components/carousel"
import { priceBucketValue, PRICE_BUCKETS, type PriceBucketId, type MealType, type AtmosphereType, type UAEEmirate, type ShadiRestaurant, type CuisineType } from "@/types/restaurant"
import { useLanguage } from "@/context/LanguageProvider"
import { useTranslations } from "@/lib/translations"

type AdminSortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

// Admin sort options
const ADMIN_SORT_OPTIONS = [
  { id: "newest" as const, icon: ArrowUpDown, label: "Newest First" },
  { id: "oldest" as const, icon: ArrowDownUp, label: "Oldest First" },
  { id: "price-asc" as const, icon: ArrowUp, label: "Price: Low to High" },
  { id: "price-desc" as const, icon: ArrowDown, label: "Price: High to Low" },
] as const

// Inline Sort Button for Admin
function AdminSortButton({ currentSort, onSortChange }: { currentSort: AdminSortOptionId; onSortChange: (id: AdminSortOptionId) => void }) {
  const currentIndex = ADMIN_SORT_OPTIONS.findIndex(opt => opt.id === currentSort)
  const currentOption = ADMIN_SORT_OPTIONS[currentIndex >= 0 ? currentIndex : 0]
  const CurrentIcon = currentOption.icon

  const handleClick = useCallback(() => {
    const nextIndex = (currentIndex + 1) % ADMIN_SORT_OPTIONS.length
    onSortChange(ADMIN_SORT_OPTIONS[nextIndex].id)
  }, [currentIndex, onSortChange])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-[var(--spacing-xs)] rounded-[var(--radius-lg)] bg-[var(--color-white)] border border-[var(--fg-20)] text-[var(--fg)] hover:border-[var(--fg-30)] hover:bg-[var(--fg-5)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      aria-label={`Sort: ${currentOption.label}. Click to cycle through sort options.`}
      title={currentOption.label}
    >
      <CurrentIcon className="w-[var(--icon-size-md)] h-[var(--icon-size-md)]" strokeWidth={2} />
    </button>
  )
}

interface ContactInfo {
  type: string
  value: string
}

const CONTACT_OPTIONS = [
  { id: "phone", label: "Phone", icon: "📞", placeholder: "+971 50 123 4567" },
  { id: "website", label: "Website", icon: "🌐", placeholder: "https://restaurant.com" },
  { id: "instagram", label: "Instagram", icon: "📸", placeholder: "@restaurant" },
  { id: "facebook", label: "Facebook", icon: "👥", placeholder: "facebook.com/restaurant" },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏", placeholder: "@restaurant" },
  { id: "tiktok", label: "TikTok", icon: "🎵", placeholder: "@restaurant" },
  { id: "talabat", label: "Talabat", icon: "🍔", placeholder: "Order link" },
  { id: "noon", label: "Noon Food", icon: "🛒", placeholder: "Order link" },
  { id: "deliveroo", label: "Deliveroo", icon: "🚴", placeholder: "Order link" },
  { id: "careem", label: "Careem NOW", icon: "🚗", placeholder: "Order link" },
  { id: "ubereats", label: "Uber Eats", icon: "🍕", placeholder: "Order link" },
  { id: "zomato", label: "Zomato", icon: "🍽️", placeholder: "Order link" },
]

const EMIRATES = [
  { id: "Dubai", label: "Dubai" },
  { id: "Abu Dhabi", label: "Abu Dhabi" },
  { id: "Sharjah", label: "Sharjah" },
  { id: "Ajman", label: "Ajman" },
  { id: "Umm Al Quwain", label: "Umm Al Quwain" },
  { id: "Ras Al Khaimah", label: "Ras Al Khaimah" },
  { id: "Fujairah", label: "Fujairah" },
]

const MEAL_OPTIONS = [
  { id: "Breakfast", label: "Breakfast" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
]

const CUISINE_OPTIONS = [
  { id: "emirati", label: "Emirati" },
  { id: "arabic", label: "Arabic" },
  { id: "lebanese", label: "Lebanese" },
  { id: "indian", label: "Indian" },
  { id: "pakistani", label: "Pakistani" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "thai", label: "Thai" },
  { id: "italian", label: "Italian" },
  { id: "seafood", label: "Seafood" },
  { id: "international", label: "International" },
]

const ATMOSPHERE_OPTIONS = [
  { id: "Romantic", label: "Romantic" },
  { id: "Casual", label: "Casual" },
  { id: "Fine Dining", label: "Fine Dining" },
  { id: "Outdoor", label: "Outdoor" },
  { id: "Family Friendly", label: "Family Friendly" },
  { id: "Live Music", label: "Live Music" },
  { id: "View", label: "View" },
]

/* =========================
   Multi-Select Dropdown
========================= */

interface MultiSelectDropdownProps {
  label: string
  selected: string[]
  options: readonly { id: string; label: string }[]
  onChange: (values: string[]) => void
}

function MultiSelectDropdown({ label, selected, options, onChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectedLabels = selected.map((s) => options.find((o) => o.id === s)?.label || s)

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1 text-[var(--fg)]">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)] text-left flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length > 0 ? selectedLabels.join(", ") : `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[var(--color-white)] border border-[var(--fg-10)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--fg-5)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-[var(--fg)]">{option.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface AdminClientProps {
  initialRestaurants: ShadiRestaurant[]
}

export const AdminClient = memo(function AdminClient({ initialRestaurants }: AdminClientProps) {
  const { language } = useLanguage()
  const { t } = useTranslations(language)
  const [data, setData] = useState(initialRestaurants)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showContactMenu, setShowContactMenu] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const readersRef = useRef<FileReader[]>([])  // Track readers for cleanup
  const [newRestaurant, setNewRestaurant] = useState<{
    name: string
    emirate: UAEEmirate
    district: string
    address: string
    meals: MealType[]
    cuisines: string[]
    atmospheres: AtmosphereType[]
    priceBucketId: PriceBucketId
    description: string
    images: string[]
    mainImageIndex: number
    contacts: ContactInfo[]
  }>({
    name: "",
    emirate: "Dubai",
    district: "",
    address: "",
    meals: [],
    cuisines: [],
    atmospheres: [],
    priceBucketId: 4, // Default: 50-100 AED
    description: "",
    images: [],
    mainImageIndex: 0,
    contacts: [],
  })

  // Filters
  const [cuisine, setCuisine] = useState<CuisineOption>("all")
  const [meal, setMeal] = useState<MealOption>("all")
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>("all")
  const [sort, setSort] = useState<AdminSortOptionId>("newest")

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      setData((prev) => prev.filter((r) => r.id !== deleteConfirmId))
      setDeleteConfirmId(null)
    }
  }, [deleteConfirmId])

  const handleEdit = useCallback((id: string) => {
    // TODO: Implement edit functionality
    console.log(`Edit restaurant with ID: ${id}`)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      readersRef.current.push(reader)  // Track reader for cleanup

      reader.onloadend = () => {
        setNewRestaurant((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    })
  }, [])

  // Cleanup readers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      readersRef.current.forEach(reader => {
        try {
          reader.abort()
        } catch {
          // Ignore errors during cleanup
        }
      })
      readersRef.current = []
    }
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setNewRestaurant((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index)
      const newMainIndex = prev.mainImageIndex >= index ? Math.max(0, prev.mainImageIndex - 1) : prev.mainImageIndex
      return {
        ...prev,
        images: newImages,
        mainImageIndex: newMainIndex,
      }
    })
  }, [])

  const handleSetMainImage = useCallback((index: number) => {
    setNewRestaurant((prev) => ({ ...prev, mainImageIndex: index }))
  }, [])

  const handleAddContact = useCallback((contactType: string) => {
    const contact = CONTACT_OPTIONS.find((c) => c.id === contactType)
    if (!contact) return

    setNewRestaurant((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { type: contactType, value: "" }],
    }))
    setShowContactMenu(false)
  }, [])

  const handleRemoveContact = useCallback((index: number) => {
    setNewRestaurant((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }, [])

  const handleContactChange = useCallback((index: number, value: string) => {
    setNewRestaurant((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => (i === index ? { ...c, value } : c)),
    }))
  }, [])

  // Stable input change handlers to prevent re-renders
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRestaurant(prev => ({ ...prev, name: e.target.value }))
  }, [])

  const handleEmirateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRestaurant(prev => ({ ...prev, emirate: e.target.value as UAEEmirate }))
  }, [])

  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRestaurant(prev => ({ ...prev, district: e.target.value }))
  }, [])

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRestaurant(prev => ({ ...prev, address: e.target.value }))
  }, [])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewRestaurant(prev => ({ ...prev, description: e.target.value }))
  }, [])

  const handleMealsChange = useCallback((values: string[]) => {
    setNewRestaurant(prev => ({ ...prev, meals: values as MealType[] }))
  }, [])

  const handleCuisinesChange = useCallback((values: string[]) => {
    setNewRestaurant(prev => ({ ...prev, cuisines: values }))
  }, [])

  const handleAtmospheresChange = useCallback((values: string[]) => {
    setNewRestaurant(prev => ({ ...prev, atmospheres: values as AtmosphereType[] }))
  }, [])

  const handlePriceBucketChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRestaurant(prev => ({ ...prev, priceBucketId: Number(e.target.value) as PriceBucketId }))
  }, [])

  const handleAddRestaurant = useCallback(() => {
    if (!newRestaurant.name || newRestaurant.cuisines.length === 0) {
      setFormError(t("errorNameAndCuisineRequired"))
      return
    }

    setFormError(null)

    const mainImage = newRestaurant.images[newRestaurant.mainImageIndex] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
    const priceBucket = PRICE_BUCKETS.find((b) => b.id === newRestaurant.priceBucketId)!

    const restaurant: ShadiRestaurant = {
      id: `rest-${Date.now()}`,
      slug: newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRestaurant.name,
      cuisine: newRestaurant.cuisines[0] as CuisineType, // Primary cuisine
      priceBucketId: newRestaurant.priceBucketId,
      minPrice: priceBucket.minPrice,
      maxPrice: priceBucket.maxPrice,
      description: newRestaurant.description,
      image: mainImage,
      images: newRestaurant.images.length > 0 ? newRestaurant.images : [mainImage],
      meals: newRestaurant.meals.length > 0 ? newRestaurant.meals : ["Breakfast", "Lunch", "Dinner"],
      atmosphere: newRestaurant.atmospheres.length > 0 ? newRestaurant.atmospheres : ["Casual"],
      district: newRestaurant.district,
      emirate: newRestaurant.emirate as UAEEmirate,
      addedDate: new Date().toISOString(),
    }

    setData((prev) => [restaurant, ...prev])
    setNewRestaurant({
      name: "",
      emirate: "Dubai",
      district: "",
      address: "",
      meals: [],
      cuisines: [],
      atmospheres: [],
      priceBucketId: 4,
      description: "",
      images: [],
      mainImageIndex: 0,
      contacts: [],
    })
    setIsAddModalOpen(false)
  }, [newRestaurant])

  // Apply filters
  const filteredData = useMemo(() => {
    let results = [...data]

    if (meal !== "all") {
      results = results.filter((r) => r.meals?.includes(meal))
    }

    if (cuisine !== "all") {
      results = results.filter((r) => r.cuisine?.toLowerCase() === cuisine.toLowerCase())
    }

    if (atmosphere !== "all") {
      results = results.filter((r) => r.atmosphere?.includes(atmosphere))
    }

    // Sort (create new array to avoid mutation)
    const sorted = [...results].sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return priceBucketValue(b.priceBucketId) - priceBucketValue(a.priceBucketId)
        case "price-asc":
          return priceBucketValue(a.priceBucketId) - priceBucketValue(b.priceBucketId)
        case "newest":
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateB - dateA
        case "oldest":
          const dateC = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateD = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateC - dateD
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return sorted
  }, [data, cuisine, meal, atmosphere, sort])

  return (
    <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-[var(--spacing-lg)]">
      <div className="flex items-center justify-between mb-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--fg)]">
          {t("adminDashboard")}
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-2 sm:px-4 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          {t("addRestaurant")}
        </button>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-col gap-[var(--spacing-md)] mb-[var(--spacing-lg)]">
        <FilterSystem
          cuisine={cuisine}
          onCuisineChange={setCuisine}
          meal={meal}
          onMealChange={setMeal}
          atmosphere={atmosphere}
          onAtmosphereChange={setAtmosphere}
        />
        <div className="flex justify-end">
          <AdminSortButton currentSort={sort} onSortChange={setSort} />
        </div>
      </div>

      {/* Grid */}
      {filteredData.length === 0 ? (
        <div className="text-center py-[var(--spacing-5xl)]">
          <p className="text-[var(--font-size-lg)] text-[var(--fg-70)]">{t("noRestaurantsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
          {filteredData.map((restaurant) => (
            <div key={restaurant.id} className="relative group">
              <RestaurantCard
                {...restaurant}
                variant="detailed"
                href={`/restaurants/${restaurant.slug}`}
                locale={language}
              />

              <div className="absolute top-[var(--spacing-sm)] right-[var(--spacing-sm)] flex flex-col gap-[var(--spacing-xs)] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(restaurant.id)}
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDelete(restaurant.id)}
                  className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Restaurant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-xl)] p-6 w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">Restaurant Images</label>

              {/* Image Preview Carousel */}
              {newRestaurant.images.length > 0 && (
                <div className="mb-4 aspect-[16/9] rounded-lg overflow-hidden">
                  <CardCarousel
                    images={newRestaurant.images}
                    alt="Restaurant preview"
                    height="100%"
                    className="h-full"
                    restaurantName={newRestaurant.name || "New Restaurant"}
                    showIndicators={true}
                  />
                </div>
              )}

              {/* Thumbnail Strip for Management */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {newRestaurant.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      index === newRestaurant.mainImageIndex ? "border-[var(--color-primary)]" : "border-transparent"
                    }`}
                    onClick={() => handleSetMainImage(index)}
                  >
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    {index === newRestaurant.mainImageIndex && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                        Main
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(index) }}
                      className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-32 h-32 rounded-lg border-2 border-dashed border-[var(--fg-20)] flex flex-col items-center justify-center text-[var(--fg-50)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs mt-1">Add Photo</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Restaurant Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Restaurant Name *</label>
              <input
                type="text"
                value={newRestaurant.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="Restaurant name"
              />
            </div>

            {/* Emirate */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Emirate</label>
              <select
                value={newRestaurant.emirate}
                onChange={handleEmirateChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
              >
                {EMIRATES.map((emirate) => (
                  <option key={emirate.id} value={emirate.id}>
                    {emirate.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Meal Type (Multi-select) */}
            <div className="mb-4">
              <MultiSelectDropdown
                label="Meal Type"
                selected={newRestaurant.meals}
                options={MEAL_OPTIONS}
                onChange={handleMealsChange}
              />
            </div>

            {/* Cuisine (Multi-select) */}
            <div className="mb-4">
              <MultiSelectDropdown
                label="Cuisine *"
                selected={newRestaurant.cuisines}
                options={CUISINE_OPTIONS}
                onChange={handleCuisinesChange}
              />
            </div>

            {/* Atmosphere (Multi-select) */}
            <div className="mb-4">
              <MultiSelectDropdown
                label="Atmosphere"
                selected={newRestaurant.atmospheres}
                options={ATMOSPHERE_OPTIONS}
                onChange={handleAtmospheresChange}
              />
            </div>

            {/* Price Range - AED Buckets */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Price Range (AED)</label>
              <select
                value={newRestaurant.priceBucketId}
                onChange={handlePriceBucketChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
              >
                {PRICE_BUCKETS.map((bucket) => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.labelAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Details */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">District</label>
              <input
                type="text"
                value={newRestaurant.district}
                onChange={handleDistrictChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="e.g., Downtown, Marina"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Full Address</label>
              <input
                type="text"
                value={newRestaurant.address}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="Building, street, area"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Description</label>
              <textarea
                value={newRestaurant.description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                rows={3}
                placeholder="Restaurant description"
              />
            </div>

            {/* Contacts Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">Contact & Social</label>
              {newRestaurant.contacts.map((contact, index) => {
                const contactOption = CONTACT_OPTIONS.find((c) => c.id === contact.type)
                return (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="text-lg">{contactOption?.icon}</span>
                    <input
                      type="text"
                      value={contact.value}
                      onChange={(e) => handleContactChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                      placeholder={contactOption?.placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="px-2 py-1 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowContactMenu(!showContactMenu)}
                  className="w-full px-3 py-2 border border-dashed border-[var(--fg-20)] rounded-lg text-[var(--fg-70)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Contact
                </button>
                {showContactMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-white)] border border-[var(--fg-10)] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {CONTACT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAddContact(option.id)}
                        className="w-full px-3 py-2 text-left hover:bg-[var(--fg-5)] flex items-center gap-2 text-[var(--fg)]"
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddRestaurant}
                className="flex-1 px-3 py-2 sm:px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)]/90"
              >
                Add Restaurant
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-3 py-2 sm:px-4 bg-[var(--fg-10)] text-[var(--fg)] rounded-lg font-medium hover:bg-[var(--fg-20)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card-bg)] rounded-[var(--radius-xl)] p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">{t("deleteConfirmation")}</h3>
            <p className="text-sm text-[var(--fg-70)] mb-6">
              {t("deleteConfirmMessage")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                {t("yesDelete")}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-[var(--fg-10)] text-[var(--fg)] rounded-lg font-medium hover:bg-[var(--fg-20)]"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
