import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ITopic } from '../../models/Topic'
import { getTopics } from '../../lib/data'
import { TopicsSection } from '../../components/TopicsSection'

interface TopicsPageProps {
  topics: ITopic[]
}

const TopicsPage: React.FC<TopicsPageProps> = ({ topics }) => {
  const router = useRouter()

  const handleTopicClick = (topic: ITopic) => {
    // Navigate to topic detail page (to be implemented)
    console.log('Navigate to topic:', topic.name)
    // router.push(`/topics/${encodeURIComponent(topic.name)}`)
  }

  return (
    <>
      <Head>
        <title>Topics - Gaudiya Kirtan</title>
        <meta name="description" content="Browse songs by topic or category" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        <TopicsSection
          topics={topics}
          title="Topics"
          onTopicClick={handleTopicClick}
        />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const dbTopics = await getTopics()
  const topics = dbTopics.map((t: any) => ({
    name: t.topic,
  }))
  return {
    props: { topics },
    revalidate: 60 * 60
  }
}

export default TopicsPage