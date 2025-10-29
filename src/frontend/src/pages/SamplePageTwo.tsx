'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CasePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">My Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Placeholder text</p>
        </CardContent>
      </Card>
    </div>
  )
}

