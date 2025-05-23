"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DebugPanelProps {
  data: any
  title?: string
}

export default function DebugPanel({ data, title = "Debug Data" }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="mb-2">
        {isVisible ? "Hide Debug" : "Show Debug"}
      </Button>

      {isVisible && (
        <Card className="w-[400px] max-h-[500px] overflow-auto shadow-lg border-red-300">
          <CardHeader className="py-2 bg-red-50">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {title}
              <Badge variant="outline" className="ml-2">
                DEV ONLY
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 text-xs font-mono">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
