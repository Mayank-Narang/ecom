import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Sun, Leaf, Zap, ShoppingCart, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-success/10">
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-success/20 text-success-foreground">
              <Leaf className="h-4 w-4 mr-2" />
              Eco-Friendly Solar Solutions
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Smart Solar
            <span className="text-primary block">Management System</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Revolutionize your energy future with our comprehensive solar management platform. 
            Shop premium solar products and share your experiences with our community.
          </p>
          
          <div className="flex justify-center">
            <Link to="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Solar Products
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Our Solar Platform?
          </h2>
          
          <div className="grid md:grid-3 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Sun className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Premium Solar Products</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  High-quality solar panels, inverters, batteries, and accessories from trusted manufacturers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <CardHeader>
                <div className="mx-auto bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-xl">Smart Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced monitoring and management tools to optimize your solar energy system performance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
              <CardHeader>
                <div className="mx-auto bg-info/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-info" />
                </div>
                <CardTitle className="text-xl">Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time feedback analysis and sentiment tracking to continuously improve our services.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Go Solar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied customers who have made the switch to clean, renewable energy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                Browse Products
              </Button>
            </Link>
            
            <Link to="/admin">
              <Button variant="outline" size="lg" className="px-8 py-3">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
