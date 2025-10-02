import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'

type FeedItem = { title: string; link: string; pubDate?: string; }

export async function getServerSideProps() {
  try {
    // Simple RSS-to-JSON endpoint (example: dev.to top posts RSS proxied by rss2json)
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=https://hnrss.org/frontpage'
    const res = await fetch(url)
    const json = await res.json()
    const items = (json.items || []).slice(0, 15).map((i: any) => ({
      title: i.title,
      link: i.link,
      pubDate: i.pubDate
    }))
    return { props: { items } }
  } catch {
    return { props: { items: [] } }
  }
}

export default function BlogPage({ items }: { items: FeedItem[] }) {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Platform Updates</h1>
        <p className="text-gray-600">Curated updates pulled daily from the web.</p>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="block p-4 rounded-md border hover:bg-gray-50">
              <div className="font-medium">{item.title}</div>
              {item.pubDate && <div className="text-xs text-gray-500 mt-1">{new Date(item.pubDate).toLocaleString()}</div>}
            </a>
          ))}
          {items.length === 0 && <p className="text-gray-500">No updates available.</p>}
        </div>
      </div>
    </MainLayout>
  )
}


