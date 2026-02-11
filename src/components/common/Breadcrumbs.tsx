import React from 'react'
import { motion } from 'framer-motion'
import { Home, ChevronRight } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  onNavigate?: (path: string) => void
}

// ============================================================================
// BREADCRUMBS COMPONENT
// ============================================================================

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 0',
      }}
    >
      {items.map((item, index) => {
        const isFirst = index === 0
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {/* Separator */}
            {index > 0 && (
              <ChevronRight
                size={14}
                style={{
                  color: 'var(--apex-muted, #52525B)',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Breadcrumb item */}
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              {isLast ? (
                /* Current page — not clickable */
                <span
                  aria-current="page"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--apex-white, #FFFFFF)',
                    lineHeight: 1,
                  }}
                >
                  {isFirst && <Home size={13} />}
                  {item.label}
                </span>
              ) : (
                /* Navigable crumb */
                <button
                  type="button"
                  onClick={() => item.path && onNavigate?.(item.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 13,
                    fontWeight: 400,
                    color: 'var(--apex-steel, #71717A)',
                    cursor: item.path ? 'pointer' : 'default',
                    lineHeight: 1,
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      'var(--apex-silver, #A1A1AA)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      'var(--apex-steel, #71717A)')
                  }
                >
                  {isFirst && <Home size={13} />}
                  {item.label}
                </button>
              )}
            </motion.span>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
