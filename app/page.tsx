"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { FaGithub, FaStar, FaMapMarkerAlt, FaBuilding, FaUsers } from "react-icons/fa"
import Link from "next/link"
import { trackEvent } from "@/lib/utils/analytics"
import { useDebounce } from "@/lib/utils/debounce"
import type { NormalizedProfile } from "@/types/github"
import { FloatingCounter } from "@/components/floating-counter"
import bgImage from "@/public/bg.jpg"


export default function LandingPage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewUser, setPreviewUser] = useState<NormalizedProfile | null>(null)
  const [isFetchingPreview, setIsFetchingPreview] = useState(false)
  const [starCount, setStarCount] = useState(0)
  const [displayedStars, setDisplayedStars] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('/api/github/stars')
        if (response.ok) {
          const data = await response.json()
          setStarCount(data.stars || 0)
        }
      } catch {
        setStarCount(0)
      }
    }
    fetchStarCount()
  }, [])

  useEffect(() => {
    if (starCount === 0) return
    const duration = 500
    const steps = 40
    const increment = starCount / steps
    const stepDuration = duration / steps
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const nextValue = Math.min(Math.floor(increment * currentStep), starCount)
      setDisplayedStars(nextValue)
      if (currentStep >= steps) {
        setDisplayedStars(starCount)
        clearInterval(timer)
      }
    }, stepDuration)
    return () => clearInterval(timer)
  }, [starCount])

  const debouncedUsername = useDebounce(username.trim(), 500)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (!debouncedUsername || debouncedUsername.length < 1) {
      setPreviewUser(null)
      setIsFetchingPreview(false)
      return
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setIsFetchingPreview(true)
    const fetchPreview = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${debouncedUsername}`, {
          headers: { Accept: "application/vnd.github+json" },
          signal: abortController.signal,
        })
        if (abortController.signal.aborted) return
        if (response.ok) {
          const data = await response.json()
          setPreviewUser({
            username: data.login,
            name: data.name,
            bio: data.bio,
            avatar_url: data.avatar_url,
            location: data.location,
            email: data.email,
            website: data.blog || null,
            twitter_username: data.twitter_username,
            company: data.company,
            followers: data.followers,
            following: data.following,
            public_repos: data.public_repos,
            created_at: data.created_at,
          })
        } else {
          setPreviewUser(null)
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setPreviewUser(null)
      } finally {
        if (!abortController.signal.aborted) setIsFetchingPreview(false)
      }
    }
    fetchPreview()
    return () => { abortController.abort() }
  }, [debouncedUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    trackEvent('portfolio-generation-started', { username: username.trim() })
    setIsLoading(true)
    router.push(`/${username.trim()}`)
  }

  return (
    <div className="min-h-screen text-foreground flex flex-col">

      {/* Background Image with LQIP (Low Quality Image Placeholder) */}
      <div className="fixed inset-0 z-0">
        <Image
          alt="Background"
          src={bgImage}
          fill
          priority
          placeholder="blur"
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[826px] px-4">
        <div className="flex w-full flex-row items-center justify-between gap-3 rounded-full border border-white/20 px-3 py-2.5 backdrop-blur-lg bg-white/10 transition-colors duration-1000 md:gap-4 md:px-3.5 md:py-3">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity ml-2.5 md:ml-3">
            <span className="text-lg md:text-xl text-white font-bold font-[var(--font-playfair)] italic">
              CodeDevs
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/Atharvsinh-codez/CodeDevs"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center justify-center gap-1.5 outline-none transition-all duration-300 border border-white/30 text-white px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 hover:scale-105 text-sm tracking-normal cursor-pointer"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
              {displayedStars > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-medium">
                  <FaStar className="h-3 w-3" />
                  <span className="tabular-nums">{displayedStars.toLocaleString()}</span>
                </span>
              )}
            </Link>
            <Link
              href="https://github.com/Atharvsinh-codez/CodeDevs"
              target="_blank"
              rel="noreferrer"
              className="md:hidden flex items-center justify-center gap-1 outline-none transition-all duration-300 border border-white/30 text-white px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-xs cursor-pointer"
            >
              <FaGithub className="h-4 w-4" />
              {displayedStars > 0 && (
                <span className="flex items-center gap-0.5 text-yellow-400 text-[10px] font-medium">
                  <FaStar className="h-2.5 w-2.5" />
                  <span className="tabular-nums">{displayedStars > 999 ? `${(displayedStars / 1000).toFixed(1)}k` : displayedStars}</span>
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen w-full flex items-center justify-center px-5 md:px-[50px] pt-20">
          <div className="w-full max-w-[826px] mx-auto">
            <div className="flex flex-col items-center justify-center text-center gap-8 md:gap-[50px]">
              {/* Logo and Description */}
              <div className="flex flex-col items-center gap-3 md:gap-8">
                <h1 className="text-5xl md:text-7xl font-bold text-white font-[var(--font-playfair)] italic drop-shadow-lg">
                  CodeDevs
                </h1>
                <p className="text-base md:text-2xl px-5 md:px-10 font-normal text-white tracking-normal opacity-80 max-w-2xl">
                  Turn your GitHub into a stunning portfolio. Powered by AI, zero coding required.
                </p>
              </div>

              {/* Form */}
              <div className="max-w-md mx-auto relative w-full">
                <form onSubmit={handleSubmit} className="relative flex gap-2 p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-xl">
                  <div className="relative flex-1">
                    <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="text"
                      placeholder="github-username"
                      className="w-full pl-12 pr-4 py-3 border-0 shadow-none bg-transparent text-white placeholder:text-white/50 focus:outline-none text-base"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!username || isLoading}
                    className="px-6 py-3 rounded-full bg-gray-700 text-white font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    Generate
                  </button>
                </form>
              </div>

              {/* Preview User Card */}
              {previewUser && (
                <div className="max-w-md mx-auto pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
                  <div className="border-white/20 shadow-lg bg-white/10 backdrop-blur-xl rounded-xl p-5 border">
                    <div className="flex items-start gap-4">
                      <Image
                        src={previewUser.avatar_url}
                        alt={previewUser.username}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-white/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base truncate text-white">
                            {previewUser.name || previewUser.username}
                          </h3>
                          {previewUser.name && (
                            <span className="text-sm text-white/60 truncate">
                              @{previewUser.username}
                            </span>
                          )}
                        </div>
                        {previewUser.bio && (
                          <p className="text-sm text-white/60 line-clamp-2 mb-2">
                            {previewUser.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                          {previewUser.location && (
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-3 w-3" />
                              <span>{previewUser.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FaUsers className="h-3 w-3" />
                            <span>{previewUser.followers} followers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaGithub className="h-3 w-3" />
                            <span>{previewUser.public_repos} repos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isFetchingPreview && username.trim() && (
                <div className="max-w-md mx-auto text-center text-sm text-white/70">
                  Checking GitHub profile...
                </div>
              )}

              <div className="text-sm text-white/70">
                <span className="mr-2">Try:</span>
                <button
                  onClick={() => setUsername("t3dotgg")}
                  className="underline hover:text-white transition-colors mr-2"
                >
                  Theo Browne
                </button>
                <span className="mr-2">•</span>
                <button
                  onClick={() => setUsername("SreejanPersonal")}
                  className="underline hover:text-white transition-colors"
                >
                  SreejanPersonal
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Portfolio Counter */}
      <FloatingCounter />

      {/* Simple Footer */}
      <footer className="relative z-10 py-8">
        <div className="text-center">
          <p className="text-white/60 text-sm font-medium tracking-wide">
            Made By <span className="text-white font-semibold">At41rv</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
