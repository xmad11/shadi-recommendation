"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { RestaurantCard } from "@/components/card"
import { FilterSystem, type CuisineOption, type MealOption, type AtmosphereOption } from "@/components/search/FilterSystem"
import { SortButton, type SortOptionId } from "@/components/search/SortSystem"
import { priceTierValue } from "@/types/restaurant"
import type { ShadiRestaurant } from "@/types/restaurant"

type AdminSortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

interface AdminClientProps {
  initialRestaurants: ShadiRestaurant[]
}

export const AdminClient = memo(function AdminClient({ initialRestaurants }: AdminClientProps) {
  const [data, setData] = useState(initialRestaurants)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    price: "$" as const,
    description: "",
    image: "",
    district: "",
    emirate: "",
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
    // Implement modal or redirect
  }, [])

  const handleAddRestaurant = useCallback(() => {
    if (!newRestaurant.name || !newRestaurant.cuisine) {
      alert("Please fill in at least the name and cuisine")
      return
    }

    const restaurant: ShadiRestaurant = {
      id: `rest-${Date.now()}`,
      slug: newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRestaurant.name,
      cuisine: newRestaurant.cuisine,
      price: newRestaurant.price,
      description: newRestaurant.description,
      image: newRestaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      images: [newRestaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"],
      meals: ["Breakfast", "Lunch", "Dinner"],
      atmosphere: ["Casual"],
      district: newRestaurant.district,
      emirate: (newRestaurant.emirate || "Dubai") as any,
      addedDate: new Date().toISOString(),
    }

    setData((prev) => [restaurant, ...prev])
    setNewRestaurant({
      name: "",
      cuisine: "",
      price: "$",
      description: "",
      image: "",
      district: "",
      emirate: "",
    })
    setIsAddModalOpen(false)
  }, [newRestaurant])

  // Apply filters
  const filteredData = useMemo(() => {
    let results = [...data]

    // Filter by meal
    if (meal !== "all") {
      results = results.filter((r) => r.meals?.includes(meal))
    }

    // Filter by cuisine
    if (cuisine !== "all") {
      results = results.filter((r) => r.cuisine?.toLowerCase() === cuisine.toLowerCase())
    }

    // Filter by atmosphere
    if (atmosphere !== "all") {
      results = results.filter((r) => r.atmosphere?.includes(atmosphere))
    }

    // Sort
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

              {/* Action buttons */}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Restaurant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                  placeholder="Restaurant name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cuisine *</label>
                <input
                  type="text"
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                  placeholder="e.g., Italian, Japanese"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price Tier</label>
                <select
                  value={newRestaurant.price}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, price: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                >
                  <option value="$">$ - Budget-friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Expensive</option>
                  <option value="$$$$">$$$$ - Very Expensive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={newRestaurant.image}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, image: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                  rows={3}
                  placeholder="Restaurant description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  type="text"
                  value={newRestaurant.district}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, district: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                  placeholder="e.g., Downtown, Marina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emirate</label>
                <select
                  value={newRestaurant.emirate}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, emirate: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--fg-20)] rounded-lg"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                </select>
              </div>
            </div>
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
