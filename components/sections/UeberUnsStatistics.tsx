'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface Statistic {
  label: string
  value: number
  suffix?: string
  icon?: string
}

interface StatisticsProps {
  title?: string
  subtitle?: string
  statistics?: Statistic[]
  backgroundColor?: string
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const increment = value / 50
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 30)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export function UeberUnsStatistics({
  title = 'Durch die Zahlen',
  subtitle = 'Statistiken',
  statistics = [
    { label: 'Zufriedene Kunden', value: 2500, suffix: '+' },
    { label: 'Jahre Erfahrung', value: 15, suffix: '+' },
    { label: 'Produkte im Katalog', value: 150, suffix: '+' },
    { label: 'Länder beliefert', value: 5, suffix: '' },
  ],
  backgroundColor = 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
}: StatisticsProps) {
  return (
    <section className={`py-24 md:py-32 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            {subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white">{title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-5xl md:text-6xl font-black text-accent mb-4">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-300 dark:text-gray-400 text-lg font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
