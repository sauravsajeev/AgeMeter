"use client"

import { useState, useEffect } from "react"

export function Alert({ type = "info", message, className = "", autoClose = true, duration = 3000,setShowAlert }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setShowAlert(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration,setShowAlert])

  if (!isVisible) return null

  return (
    <div className={`flex items-center h-8 p-2 border rounded-lg ${getAlertStyles(type)} ${className}`}>
      <span className="text-lg">{getIcon(type)}</span>
      <p className="text-sm font-medium hidden lg:block">{message}</p>
    </div>
  )
}

function getAlertStyles(type) {
  const styles = {
    info: "bg-black border-white-200 text-white dark:bg-black dark:border-white dark:text-white",
    success: "bg-black border-white-200 text-white dark:bg-black dark:border-white dark:text-white",
    warning:
      "bg-black border-white-200 text-white dark:bg-black dark:border-white dark:text-white",
    error: "bg-black border-white-200 text-white dark:bg-black dark:border-white dark:text-white",
  }
  return styles[type] || styles.info
}

function getIcon(type) {
const icons = {
  info: "ℹ︎",     // Info symbol (circle i)
  success: "✔︎",  // Check mark
  warning: "⚠︎",  // Warning triangle
  error: "✖︎"     // Multiplication X
};
  return icons[type] || icons.info
}