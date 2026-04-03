import Link from "next/link"
import Image from "next/image"
import { BarChart2, CheckCircle, FileText, LineChart, Recycle, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessAnalysisSection } from "@/components/business-analysis/BusinessAnalysisSection"

export default function BusinessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 md:py-32">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-800">
                Business Intelligence Engine
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                Transform Your Business Operations with AI-Powered Sustainability
              </h1>
              <p className="text-gray-600 md:text-xl">
                Get actionable insights to reduce your carbon footprint, optimize operations, and connect with
                sustainable vendors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/business/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/business/demo">Request Demo</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=600"
                alt="Business Dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full bg-green-100 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-green-200 opacity-50 blur-3xl"></div>
      </section>

      {/* How It Works */}
      <section className="container py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
            How Our Business Intelligence Engine Works
          </h2>
          <p className="text-gray-600 md:text-xl">
            A simple process to transform your business operations and reduce your environmental impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Connect Your Data",
              description: "Upload your business data or connect your systems via API for analysis.",
              icon: Upload,
            },
            {
              step: "2",
              title: "Get AI Insights",
              description: "Our AI analyzes your operations and identifies sustainability opportunities.",
              icon: LineChart,
            },
            {
              step: "3",
              title: "Implement & Track",
              description: "Implement recommendations and track your progress on your dashboard.",
              icon: BarChart2,
            },
          ].map((item, i) => (
            <Card key={i} className="border-0 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-100 text-green-800 w-12 h-12 flex items-center justify-center text-xl font-bold rounded-bl-lg">
                {item.step}
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  {<item.icon className="h-6 w-6 text-green-700" />}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <BusinessAnalysisSection />

      {/* Features */}
      <section className="container py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Comprehensive Business Solutions</h2>
          <p className="text-gray-600 md:text-xl">
            Everything you need to transform your business into a sustainable operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Analysis",
              description:
                "Our AI analyzes your business processes to identify sustainability opportunities and inefficiencies.",
              icon: LineChart,
            },
            {
              title: "Smart Data Pipelines",
              description: "Connect your ERP, delivery, inventory, and sales systems for comprehensive analysis.",
              icon: Recycle,
            },
            {
              title: "Suggestions Engine",
              description: "Get actionable recommendations for eco-friendly alternatives and process optimizations.",
              icon: CheckCircle,
            },
            {
              title: "Automated Quotations",
              description: "Receive automated quotes from sustainable vendors for materials and services.",
              icon: FileText,
            },
            {
              title: "Green KPI Dashboard",
              description: "Track your sustainability metrics and progress towards your environmental goals.",
              icon: BarChart2,
            },
            {
              title: "Team Integration",
              description: "Integrate with Slack, Teams, and other tools to keep your team informed and engaged.",
              icon: Upload,
            },
          ].map((feature, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  {<feature.icon className="h-6 w-6 text-green-700" />}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-800 text-white py-12 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Ready to transform your business?</h2>
              <p className="md:text-xl">
                Join hundreds of businesses that have reduced their carbon footprint and improved their bottom line with
                Ecozon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/business/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                  <Link href="/business/contact">Talk to an Expert</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Reduced packaging waste by 35%",
                "Saved 15% on logistics costs",
                "Decreased carbon emissions by 40%",
                "Improved customer satisfaction",
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 p-6 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-300 mb-2" />
                  <p className="font-medium">{stat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
