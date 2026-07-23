import React from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ISongGroup } from '../../models/Collections'
import { getSongGroups } from '../../services'
import { TopicsSection } from '../../components/TopicsSection'
import { EmptyState } from '../../components/ui/EmptyState'
import { TopicsIcon } from '../../components/icons/SidebarIcons'

interface TopicsPageProps {
  topics: ISongGroup[]
}

const TopicsPage: React.FC<TopicsPageProps> = ({ topics }) => {
  const router = useRouter()
  const handleTopicClick = (topic: ISongGroup) => {
    router.push(`/topics/${topic.uid}`)
  }

  return (
    <>
      <Head>
        <title>Topics - Gaudiya Kirtan</title>
        <meta name="description" content="Browse songs by topic or category" />
      </Head>

      <div className="w-full max-w-screen-lg pb-12 mx-auto">
        {topics.length > 0 ? (
          <TopicsSection topics={topics} title="Topics" onTopicClick={handleTopicClick} />
        ) : (
          <>
            <div className="px-4 py-4">
              <h1 className="text-xl font-bold text-[var(--primary)]">Topics</h1>
            </div>
            {/* No topic groupings ship in the corpus yet (docs/data/collections.md) - a tasteful
                empty state, never fabricated rows (docs/screens/browse.md). This lights up
                automatically once song_groups.json ships topic entries. */}
            <EmptyState
              icon={<TopicsIcon />}
              title="No topics yet"
              message="Thematic groupings like deity, festival, or mood will appear here once the corpus ships topic tags."
            />
          </>
        )}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<TopicsPageProps> = async () => {
  // No topic groupings are shipped in the corpus yet - see services/songGroupRepository.ts.
  return {
    props: {
      topics: getSongGroups('topic'),
    },
  }
}

export default TopicsPage
