import Link from "next/link";
import { Navbar } from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Upload,
  Zap,
  BarChart3,
  Lightbulb,
  Users,
  Download,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Crown,
  Rocket,
  CreditCard,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/50 py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6 text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-tight">
                  Transform Customer Complaints into{" "}
                  <span className="text-primary">Actionable Insights</span>
                </h1>
                <p className="text-lg text-foreground/90 max-w-xl leading-relaxed">
                  Upload your CSV data and get instant visualizations, KPIs, and analytics to improve
                  customer service quality and drive business decisions.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth">
                    <Button size="lg" className="text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 h-auto rounded-md">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-base font-medium border-2 border-foreground/30 hover:bg-muted px-8 py-6 h-auto rounded-md bg-background">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">No setup required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">Real-time processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium">Secure & compliant</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:flex items-center justify-center">
                <div className="w-full max-w-lg aspect-video rounded-xl border-2 border-primary/30 bg-background p-6 shadow-2xl transform rotate-3">
                  <div className="h-full w-full rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-4 relative">
                    {/* Simulated dashboard visualization */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md z-10">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      Processing Complete
                    </div>
                    <div className="grid h-full grid-cols-2 gap-3 pt-2">
                      {/* Donut chart simulation */}
                      <div className="rounded-lg bg-background p-3 border border-border/50 shadow-sm">
                        <div className="h-20 w-20 rounded-full border-8 border-green-500 mx-auto mt-1"></div>
                      </div>
                      {/* Bar chart simulation */}
                      <div className="rounded-lg bg-background p-3 border border-border/50 shadow-sm">
                        <div className="h-full flex items-end justify-center gap-1.5">
                          <div className="flex-1 bg-primary h-3/4 rounded-t max-w-[20px]"></div>
                          <div className="flex-1 bg-primary/70 h-2/3 rounded-t max-w-[20px]"></div>
                          <div className="flex-1 bg-primary h-4/5 rounded-t max-w-[20px]"></div>
                          <div className="flex-1 bg-primary/80 h-3/4 rounded-t max-w-[20px]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">
                Powerful Features for Data Analysts
              </h2>
              <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Everything you need to turn raw customer complaint data into meaningful insights
                that drive business improvements.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Upload,
                  title: "Smart CSV Upload",
                  description: "Drag and drop your CSV files with automatic validation and preview.",
                },
                {
                  icon: Zap,
                  title: "Real-time Processing",
                  description: "Watch your data transform in real-time with live progress tracking.",
                },
                {
                  icon: BarChart3,
                  title: "Interactive Visualizations",
                  description: "Explore your data with interactive charts, graphs, and dashboards.",
                },
                {
                  icon: Lightbulb,
                  title: "AI-Powered Insights",
                  description: "Get intelligent analysis and recommendations from your data.",
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description: "Share insights and collaborate with your team members.",
                },
                {
                  icon: Download,
                  title: "Export & Reporting",
                  description: "Export your analysis in multiple formats for presentations.",
                },
              ].map((feature, index) => (
                <Card key={index} className="border border-border/50 bg-background hover:border-primary/30 transition-all hover:shadow-md text-center">
                  <CardHeader className="pb-4">
                    <div className="flex justify-center mb-4">
                      <feature.icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base text-foreground/70 leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-background py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-foreground/80">
                Transform your data in three simple steps
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Upload Your Data",
                  description:
                    "Simply drag and drop your CSV file containing customer complaints and reclamation data.",
                },
                {
                  step: "2",
                  title: "AI Processing",
                  description:
                    "Our advanced algorithms analyze your data, identify patterns, and generate meaningful insights.",
                },
                {
                  step: "3",
                  title: "Visualize Results",
                  description:
                    "Explore interactive dashboards, charts, and KPIs to make data-driven decisions.",
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold shadow-md">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-foreground/80 leading-relaxed max-w-sm mx-auto">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="bg-primary py-16 lg:py-20 text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Ready to Transform Your Customer Data?
            </h2>
            <p className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
              Join hundreds of companies already using Dallosh Analysis to improve their customer
              service quality.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="text-base font-medium bg-white text-primary hover:bg-white/90 px-8 py-6 h-auto rounded-md">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base font-medium border-2 border-white/40 text-white hover:bg-white/10 px-8 py-6 h-auto rounded-md bg-transparent">
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-sm font-bold">D</span>
                </div>
                <span className="font-semibold text-white text-lg">Dallosh Analysis</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Transforming customer complaint data into actionable business insights.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-400 hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-gray-400 hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Connect</h4>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Twitter
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                  LinkedIn
                </Link>
                <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 Dallosh Analysis. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

