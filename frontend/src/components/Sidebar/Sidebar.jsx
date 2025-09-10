"use client"

import { useState, useEffect } from "react"
import "./Sidebar.css"

const Sidebar = ({ isOpen, onClose, savedDocuments, deleteSavedDoc }) => {
  const [documents, setDocuments] = useState([])
  const [expandedGoal, setExpandedGoal] = useState(null)

  useEffect(() => {
    setDocuments(savedDocuments)
  }, [savedDocuments])

  const handleDeleteClick = (e, doc) => {
    e.stopPropagation()
    console.log("[v0] deleting Goal:", doc.title)
    deleteSavedDoc(doc.title)
    setDocuments(documents.filter((item) => item.title !== doc.title))
  }

  const handleGoalClick = (goalId) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Goals
            </div>
          </div>

          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc._id} className={`document-item ${expandedGoal === doc._id ? "expanded" : ""}`}>
                <div className="goal-header" onClick={() => handleGoalClick(doc._id)}>
                  <div className="document-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                      <line x1="12" y1="2" x2="12" y2="6" />
                      <line x1="22" y1="12" x2="18" y2="12" />
                      <line x1="12" y1="22" x2="12" y2="18" />
                      <line x1="2" y1="12" x2="6" y2="12" />
                    </svg>
                  </div>
                  <div className="document-info">
                    <div className="document-title">{doc.title}</div>
                    <div className="document-actions">
                      <button
                        className="delete-btn"
                        onClick={(e) => handleDeleteClick(e, doc)}
                        aria-label="Delete goal"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                      <div className="expand-indicator">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={expandedGoal === doc._id ? "rotated" : ""}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedGoal === doc._id && (
                  <div className="goal-details">
                    {doc.des && (
                      <div className="goal-description">
                        <span className="detail-label">Description:</span>
                        <p>{doc.des}</p>
                      </div>
                    )}
                    {(doc.day || doc.targetage) && (
                      <div className="goal-date">
                        <span className="detail-label">{doc.day ? "Target Day:" : "Target Age:"}</span>
                        <span className="date-value">{doc.day ? doc.day : doc.targetage + " Age"} </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
