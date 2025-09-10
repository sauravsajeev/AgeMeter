"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const DropDown = ({ onSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState("Select time")

  const options = [
    { value: "tomorrow", label: "Tomorrow" },
    { value: "next-week", label: "Next Week" },
    { value: "next-month", label: "Next Month" },
  ]

  const handleSelect = (option) => {
    setSelectedOption(option.label)
    setIsOpen(false)
    if (onSelect) {
      onSelect(option)
    }
  }

  return (
    <div className={`relative inline-block w-70 max-w-xs ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card-foreground border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-background">{selectedOption}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => handleSelect(option)}
                  className="w-full px-4 py-3 text-left text-sm text-black hover:bg-accent hover:text-accent-foreground transition-colors duration-150 focus:outline-none hover:border-1 rounded-sm focus:bg-accent focus:text-accent-foreground"
                  role="option"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

export default DropDown
