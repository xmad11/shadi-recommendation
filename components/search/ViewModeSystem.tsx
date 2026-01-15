"use client"

import { memo, useState } from "react"
import { ChevronDown, List, Rows1, Rows2, Rows3, Rows4 } from "@/components/icons"

export type ViewMode = "list" | "grid-1" | "grid-2" | "grid-3" | "grid-4"

interface ViewOption {
  id: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const VIEW_OPTIONS: ViewOption[] = [
  { id: "list", label: "List View", icon: List },
  { id: "grid-1", label: "1 Column", icon: Rows1 },
  { id: "grid-2", label: "2 Columns", icon: Rows2 },
  { id: "grid-3", label: "3 Columns", icon: Rows3 },
  { id: "grid-4", label: "4 Columns", icon: Rows4 },
]

interface ViewModeButtonProps {
  currentView: ViewMode
  onViewChange: (viewId: ViewMode) => void
}

function ViewModeDropdown({ currentView, onViewChange }: ViewModeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = VIEW_OPTIONS.find(opt => opt.id === currentView) || VIEW_OPTIONS[0]
  const SelectedIcon = selectedOption.icon

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--fg-20)] rounded-lg text-sm font-medium text-[var(--fg)] hover:border-[var(--fg-30)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      >
        <SelectedIcon className="w-4 h-4" />
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--fg-50)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 w-48 bg-white border border-[var(--fg-20)] rounded-lg shadow-[var(--shadow-lg)] py-1">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onViewChange(option.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    currentView === option.id
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                      : "text-[var(--fg)] hover:bg-[var(--fg-5)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export const ViewModeButton = memo(ViewModeDropdown)
