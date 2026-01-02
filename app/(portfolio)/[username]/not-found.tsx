"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BsExclamationCircle, BsArrowLeft, BsHouse } from "react-icons/bs"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="max-w-lg w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                <BsExclamationCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Portfolio Not Found</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find a GitHub user with that username. Please check the spelling and try again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/">
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  <BsHouse className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <BsArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

