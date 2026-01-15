"use client"

import { memo, useState, useCallback, useMemo, useRef } from "react"
import { RestaurantCard } from "@/components/card"
import { FilterSystem, type CuisineOption, type MealOption, type AtmosphereOption } from "@/components/search/FilterSystem"
import { SortButton, type SortOptionId } from "@/components/search/SortSystem"
import { ChevronDown, XMarkIcon } from "@/components/icons"
import { priceTierValue } from "@/types/restaurant"
import type { ShadiRestaurant } from "@/types/restaurant"

type AdminSortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

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
  { id: "Abu Dhabi", label: "Abu Dhabi" },
  { id: "Dubai", label: "Dubai" },
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

const PRICE_OPTIONS = [
  { id: "$", label: "$ - Budget-friendly" },
  { id: "$$", label: "$$ - Moderate" },
  { id: "$$$", label: "$$$ - Expensive" },
  { id: "$$$$", label: "$$$$ - Very Expensive" },
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
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
  const [data, setData] = useState(initialRestaurants)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showContactMenu, setShowContactMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    emirate: "Abu Dhabi",
    district: "",
    address: "",
    meals: [] as string[],
    cuisines: [] as string[],
    atmospheres: [] as string[],
    price: "$" as const,
    description: "",
    images: [] as string[],
    mainImageIndex: 0,
    contacts: [] as ContactInfo[],
  })

  // Filters
  const [cuisine, setCuisine] = useState<CuisineOption>("all")
  const [meal, setMeal] = useState<MealOption>("all")
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>("all")
  const [sort, setSort] = useState<SortOptionId>("newest")

  const handleDelete = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this restaurant?")) {
      setData((prev) => prev.filter((r) => r.id !== id))
    }
  }, [])

  const handleEdit = useCallback((id: string) => {
    alert(`Edit restaurant with ID: ${id}`)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewRestaurant((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    })
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

  const handleAddRestaurant = useCallback(() => {
    if (!newRestaurant.name || newRestaurant.cuisines.length === 0) {
      alert("Please fill in at least the name and cuisine")
      return
    }

    const mainImage = newRestaurant.images[newRestaurant.mainImageIndex] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"

    const restaurant: ShadiRestaurant = {
      id: `rest-${Date.now()}`,
      slug: newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRestaurant.name,
      cuisine: newRestaurant.cuisines[0], // Primary cuisine
      price: newRestaurant.price,
      description: newRestaurant.description,
      image: mainImage,
      images: newRestaurant.images.length > 0 ? newRestaurant.images : [mainImage],
      meals: newRestaurant.meals.length > 0 ? newRestaurant.meals : ["Breakfast", "Lunch", "Dinner"],
      atmosphere: newRestaurant.atmospheres.length > 0 ? newRestaurant.atmospheres : ["Casual"],
      district: newRestaurant.district,
      emirate: newRestaurant.emirate as any,
      addedDate: new Date().toISOString(),
    }

    setData((prev) => [restaurant, ...prev])
    setNewRestaurant({
      name: "",
      emirate: "Abu Dhabi",
      district: "",
      address: "",
      meals: [],
      cuisines: [],
      atmospheres: [],
      price: "$",
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

    switch (sort) {
      case "price-desc":
        results.sort((a, b) => priceTierValue(b.price) - priceTierValue(a.price))
        break
      case "price-asc":
        results.sort((a, b) => priceTierValue(a.price) - priceTierValue(b.price))
        break
      case "newest":
        results.sort((a, b) => {
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateB - dateA
        })
        break
      case "oldest":
        results.sort((a, b) => {
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateA - dateB
        })
        break
      case "name-asc":
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        results.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return results
  }, [data, cuisine, meal, atmosphere, sort])

  return (
    <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-[var(--spacing-lg)]">
      <div className="flex items-center justify-between mb-[var(--spacing-lg)]">
        <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--fg)]">
          Admin Dashboard
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          Add Restaurant
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
          <SortButton currentSort={sort} onSortChange={setSort} />
        </div>
      </div>

      {/* Grid */}
      {filteredData.length === 0 ? (
        <div className="text-center py-[var(--spacing-5xl)]">
          <p className="text-[var(--font-size-lg)] text-[var(--fg-70)]">No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
          {filteredData.map((restaurant) => (
            <div key={restaurant.id} className="relative group">
              <RestaurantCard
                {...restaurant}
                variant="detailed"
                href={`/restaurants/${restaurant.slug}`}
              />

              <div className="absolute top-[var(--spacing-sm)] right-[var(--spacing-sm)] flex flex-col gap-[var(--spacing-xs)] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(restaurant.id)}
                  className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(restaurant.id)}
                  className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
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

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">Restaurant Images</label>
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
                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="Restaurant name"
              />
            </div>

            {/* Emirate */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Emirate</label>
              <select
                value={newRestaurant.emirate}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, emirate: e.target.value })}
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
                onChange={(values) => setNewRestaurant({ ...newRestaurant, meals: values })}
              />
            </div>

            {/* Cuisine (Multi-select) */}
            <div className="mb-4">
              <MultiSelectDropdown
                label="Cuisine *"
                selected={newRestaurant.cuisines}
                options={CUISINE_OPTIONS}
                onChange={(values) => setNewRestaurant({ ...newRestaurant, cuisines: values })}
              />
            </div>

            {/* Atmosphere (Multi-select) */}
            <div className="mb-4">
              <MultiSelectDropdown
                label="Atmosphere"
                selected={newRestaurant.atmospheres}
                options={ATMOSPHERE_OPTIONS}
                onChange={(values) => setNewRestaurant({ ...newRestaurant, atmospheres: values })}
              />
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Price Range</label>
              <select
                value={newRestaurant.price}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, price: e.target.value as any })}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
              >
                {PRICE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
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
                onChange={(e) => setNewRestaurant({ ...newRestaurant, district: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="e.g., Downtown, Marina"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Full Address</label>
              <input
                type="text"
                value={newRestaurant.address}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg bg-[var(--color-white)] text-[var(--fg)]"
                placeholder="Building, street, area"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-[var(--fg)]">Description</label>
              <textarea
                value={newRestaurant.description}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
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
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)]/90"
              >
                Add Restaurant
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[var(--fg-10)] text-[var(--fg)] rounded-lg font-medium hover:bg-[var(--fg-20)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
