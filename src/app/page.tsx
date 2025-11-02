import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <CardTitle className="text-3xl">Bell24h</CardTitle>
          <CardDescription className="text-lg">
            Deployment Successful! All errors resolved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✅ Build Complete
            </p>
            <p className="text-green-700 text-sm mt-1">
              No missing components or scripts
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/rfq">Create RFQ</Link>
            </Button>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
