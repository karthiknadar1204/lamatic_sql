'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()

  return (
    <section className="w-full bg-[#111] py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 max-w-4xl">
            Chat With Your Database <span className="text-red-500">Visually</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-8">
            Transform your PostgreSQL data into interactive visualizations through natural language conversations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto px-8"
              onClick={() => router.push('/chats')}
            >
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="bg-black border-white text-white hover:bg-white hover:text-black w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
