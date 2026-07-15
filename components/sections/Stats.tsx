'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  {
    label: 'Active Riders',
    value: 15000,
    suffix: '+',
  },
  {
    label: 'Countries',
    value: 12,
    suffix: '',
  },
  {
    label: 'Awards Won',
    value: 8,
    suffix: '',
  },
  {
    label: 'Years of Excellence',
    value: 5,
    suffix: '',
  },
]

function CountUpNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

export function Stats() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return (
    <section ref={ref} className="relative py-32 bg-background overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      {/* Section Indicator */}
      <div className="section-indicator">03</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="relative group p-6 md:p-8 rounded border border-border/50 hover:border-accent/50 transition-all duration-300 hover:bg-secondary/30"
            >
              {/* Hover Accent Line */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-accent group-hover:w-full transition-all duration-300" />

              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-black text-accent">
                  {isVisible ? (
                    <>
                      <CountUpNumber target={stat.value} />
                      {stat.suffix}
                    </>
                  ) : (
                    '0'
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground uppercase font-bold tracking-widest">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
