import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectDetail() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Página em construção</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
