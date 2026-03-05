import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freestyla.app'}/s/${params.id}`

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default function SharedRecordingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
