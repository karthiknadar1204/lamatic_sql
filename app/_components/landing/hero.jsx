import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="w-full bg-[#111] py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Chat With Your Database <span className="text-red-500">Visually</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Transform your PostgreSQL data into interactive visualizations through natural language conversations
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}

