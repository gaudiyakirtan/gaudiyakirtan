import React from 'react'
import { Seo } from '../components/Seo'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { getManifest } from '../services/manifestRepository'
import { getSongGroups } from '../services/songGroupRepository'
import { PROJECT_SITE } from '../config'

interface AboutProps {
  songCount: number
  recordingCount: number
  authorCount: number
  bookCount: number
  topicCount: number
}

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--accent)] shadow-sm">
    <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
    <div className="text-sm text-[var(--neutral)] mt-1">{label}</div>
  </div>
)

const About: React.FC<AboutProps> = ({
  songCount,
  recordingCount,
  authorCount,
  bookCount,
  topicCount,
}) => (
  <>
    <Seo
      title="About — Gaudiya Kirtan"
      description="About the Gaudiya Kirtan songbook: the corpus, its sources, and how the text is prepared."
      path="/about"
    />

    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">About</h1>

      <section className="mb-10">
        <p className="mb-4 text-[var(--neutral)]">
          Gaudiya Kirtan is a songbook for the Gauḍīya Vaiṣṇava tradition — the kīrtanas, bhajanas
          and prayers of Śrīla Bhaktivinoda Ṭhākura, Śrīla Narottama dāsa Ṭhākura, Śrīla Rūpa
          Gosvāmī and the ācāryas in their line.
        </p>
        <p className="mb-4 text-[var(--neutral)]">
          Every song is presented in its original script alongside romanized transliteration,
          word-by-word meanings, and full translation, so a reader can follow the sound and the
          sense at once. The whole collection is bundled with the app and works without a network
          connection.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">The collection</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Stat value={String(songCount)} label="songs" />
          <Stat value={String(recordingCount)} label="songs with a recording" />
          <Stat value={String(authorCount)} label="authors" />
          <Stat value={String(bookCount)} label="books" />
          <Stat value={String(topicCount)} label="topics" />
          <Stat value="10" label="scripts" />
        </div>
        <p className="mt-4 text-sm text-[var(--neutral)]">
          Songs are in Bengali, Sanskrit, Hindi, Assamese and Odia. Each can be displayed in Latin
          (IAST / ISO 15919), Bengali, Devanagari, Gujarati, Kannada, Telugu, Malayalam, Tamil,
          Odia or Cyrillic script.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">How the text is prepared</h2>
        <p className="mb-4 text-[var(--neutral)]">
          One romanized master text is held for every verse, in the ISO 15919 standard, and every
          other script is generated from it. That way a correction made once propagates to all ten
          scripts, and the scripts can never silently disagree with one another.
        </p>
        <p className="mb-4 text-[var(--neutral)]">
          Transliteration is a genuinely lossy business — inherent vowels, compound joins and the
          B/V and J/Y distinctions all differ by language and script — so the master text carries
          explicit marks for those cases rather than guessing at rendering time. If a rendering
          still looks wrong to you, please{' '}
          <Link href="/contact" className="text-[var(--highlight)] hover:underline">
            tell us
          </Link>{' '}
          — corrections from readers who know the songs are the most valuable thing we receive.
        </p>
        <p className="text-[var(--neutral)]">
          Guides to{' '}
          <Link href="/resources/pronunciation" className="text-[var(--highlight)] hover:underline">
            pronunciation
          </Link>
          ,{' '}
          <Link href="/resources/diacritics" className="text-[var(--highlight)] hover:underline">
            diacritics
          </Link>{' '}
          and{' '}
          <Link href="/resources/meters" className="text-[var(--highlight)] hover:underline">
            verse meters
          </Link>{' '}
          are included for readers new to the transliteration.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Sources and acknowledgements</h2>
        <p className="mb-4 text-[var(--neutral)]">
          The songs, their arrangement into books and topics, and the English translations follow{' '}
          <em>Śrī Gauḍīya Gīti-guccha — An Anthology of Gauḍīya Vaiṣṇava Songs</em> (Abridged
          Edition, 7th ed., February 2016), compiled under the guidance of Śrī Śrīmad
          Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja and published by Gaudiya Vedanta Publications.
        </p>
        <p className="mb-4 text-[var(--neutral)]">
          Except where otherwise noted, the text of that book is made available by its publishers
          under a Creative Commons Attribution–NoDerivatives 4.0 International licence. Design,
          photographs and artwork from the book are <em>not</em> included under that licence and are
          not reproduced here.
        </p>
        <p className="text-[var(--neutral)]">
          Our gratitude to the reciters whose recordings accompany these songs, and to the
          devotees who have sent corrections. Any errors introduced in preparing this edition are
          ours, not the publishers&rsquo;.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">This edition</h2>
        <p className="mb-4 text-[var(--neutral)]">
          This is an actively developed rebuild, available on the web, iOS and Android from a single
          shared collection of songs. Features are still landing and some songs are still missing
          translations or word-by-word meanings — those gaps are shown honestly rather than filled
          with placeholder text.
        </p>
        <p className="text-[var(--neutral)]">
          More at{' '}
          <a
            href={PROJECT_SITE}
            className="text-[var(--highlight)] hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            gaudiyakirtan.com
          </a>
          , or{' '}
          <Link href="/contact" className="text-[var(--highlight)] hover:underline">
            get in touch
          </Link>
          .
        </p>
      </section>
    </div>
  </>
)

// Counts are read from the shipped corpus at build time rather than hardcoded, so this page
// cannot drift out of date as songs are added or removed (the placeholder A0 entry, for one,
// has already come and gone).
export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  const manifest = getManifest()
  return {
    props: {
      songCount: manifest.length,
      recordingCount: manifest.filter((entry) => entry.audioAvailable).length,
      authorCount: new Set(manifest.map((entry) => entry.authorUid)).size,
      bookCount: getSongGroups('book').length,
      topicCount: getSongGroups('topic').length,
    },
  }
}

export default About
