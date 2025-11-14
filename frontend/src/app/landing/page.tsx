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

        {/* Pricing Section */}
        <section id="pricing" className="border-t bg-muted/30 py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                Choose the perfect plan for your needs. All plans include access to both our proprietary models and external LLM APIs.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Starter Plan */}
              <Card className="border border-border/50 bg-background hover:border-primary/30 transition-all relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-semibold">Starter</CardTitle>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">Free</span>
                  </div>
                  <CardDescription className="text-sm text-foreground/70 mt-2">
                    Perfect for trying out our platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Up to 1,000 rows/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Proprietary models only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Basic visualizations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Email support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">1 user</span>
                    </li>
                  </ul>
                  <Link href="/auth" className="block">
                    <Button className="w-full" variant="outline">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border border-border/50 bg-background hover:border-primary/30 transition-all relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-semibold">Professional</CardTitle>
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">$99</span>
                    <span className="text-sm text-foreground/70">/month</span>
                  </div>
                  <CardDescription className="text-sm text-foreground/70 mt-2">
                    For small teams and growing businesses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Up to 50,000 rows/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Proprietary + External LLM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Advanced analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Up to 5 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">API access</span>
                    </li>
                  </ul>
                  <Link href="/auth" className="block">
                    <Button className="w-full">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Business Plan */}
              <Card className="border-2 border-primary bg-background hover:border-primary/80 transition-all relative shadow-lg">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-semibold">Business</CardTitle>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">$299</span>
                    <span className="text-sm text-foreground/70">/month</span>
                  </div>
                  <CardDescription className="text-sm text-foreground/70 mt-2">
                    For established companies with high volume
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Up to 500,000 rows/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">All LLM models included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Custom dashboards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">24/7 priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Up to 25 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Advanced API & webhooks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">White-label reports</span>
                    </li>
                  </ul>
                  <Link href="/auth" className="block">
                    <Button className="w-full">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border border-border/50 bg-background hover:border-primary/30 transition-all relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-semibold">Enterprise</CardTitle>
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  </div>
                  <CardDescription className="text-sm text-foreground/70 mt-2">
                    For large organizations with specific needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Unlimited rows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Dedicated LLM infrastructure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Custom AI model training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">Unlimited users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">SLA guarantee</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">On-premise deployment</span>
                    </li>
                  </ul>
                  <Link href="/auth" className="block">
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Pay as You Go Option */}
            <div className="mt-12 max-w-4xl mx-auto">
              <Card className="border-2 border-dashed border-primary/50 bg-muted/20">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-semibold">Pay as You Go</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Perfect for occasional users or unpredictable workloads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Proprietary Models</h4>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>$0.01 per row processed</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>No monthly commitment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Pay only for what you use</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">External LLM Models</h4>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>$0.05 per row processed</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Access to premium LLM APIs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Real-time cost tracking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link href="/auth">
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Get Started with Pay as You Go
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-foreground/70">
                All plans include a 14-day free trial. No credit card required.{" "}
                <Link href="#" className="text-primary hover:underline">
                  Compare all features
                </Link>
              </p>
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

