import { notFound } from "next/navigation"
import { DonationPage } from "@/components/donation-page"

async function getUser(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/slug/${slug}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export default async function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getUser(slug)

  if (!user) {
    notFound()
  }

  return <DonationPage user={user} />
}
