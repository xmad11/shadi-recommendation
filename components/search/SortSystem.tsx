"use client"

import { memo, useState } from "react"
import { ChevronDown } from "@/components/icons"

export type SortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

interface SortOption {
  id: SortOptionId
  label: string
  group: string
}

const SORT_OPTIONS: SortOption[] = [
  { id: "newest", label: "Newest First", group: "Date" },
  { id: "oldest", label: "Oldest First", group: "Date" },
  { id: "price-asc", label: "Price: Low to High", group: "Price" },
  { id: "price-desc", label: "Price: High to Low", group: "Price" },
  { id: "name-asc", label: "Name: A to Z", group: "Name" },
  { id: "name-desc", label: "Name: Z to A", group: "Name" },
]

interface SortButtonProps {
  currentSort: SortOptionId
  onSortChange: (sortId: SortOptionId) => void
}

function SortDropdown({ currentSort, onSortChange }: SortButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = SORT_OPTIONS.find(opt => opt.id === currentSort) || SORT_OPTIONS[0]

  // Group options by category
  const groupedOptions = SORT_OPTIONS.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = []
    }
    acc[option.group].push(option)
    return acc
  }, {} as Record<string, SortOption[]>)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--fg-20)] rounded-lg text-sm font-medium text-[var(--fg)] hover:border-[var(--fg-30)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      >
        <span className="text-[var(--fg-50)]">Sort:</span>
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--fg-50)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white border border-[var(--fg-20)] rounded-lg shadow-[var(--shadow-lg)] py-1">
            {Object.entries(groupedOptions).map(([group, options]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider">
                  {group}
                </div>
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onSortChange(option.id)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      currentSort === option.id
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                        : "text-[var(--fg)] hover:bg-[var(--fg-5)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const SortButton = memo(SortDropdown)
