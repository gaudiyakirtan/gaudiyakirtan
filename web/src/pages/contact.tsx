import React from 'react'
import { Seo } from '../components/Seo'
import Link from 'next/link'
import { CONTACT_EMAIL, PROJECT_SITE } from '../config'

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--accent)] shadow-sm mb-4">
    <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">
      {title}
    </h3>
    <div className="text-[var(--neutral)]">{children}</div>
  </div>
)

const Contact: React.FC = () => (
  <>
    <Seo
      title="Contact — Gaudiya Kirtan"
      description="Send a song correction, request a song, or report a problem with the Gaudiya Kirtan app."
      path="/contact"
      noindex
    />

    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">Contact</h1>

      <p className="mb-6 text-[var(--neutral)]">
        We would be glad to hear from you — especially about the songs themselves. Corrections from
        readers who know these kīrtanas well are the single most useful thing we receive.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">What to send</h2>

        <Card title="A correction to a song">
          A wrong syllable, a mistaken transliteration, a translation that reads awry. Please
          include the song title and, if you can, the verse number — that is enough for us to find
          it. Corrections are made to the master text, so a single fix reaches every script.
        </Card>

        <Card title="A song that is missing">
          The collection follows a published anthology and does not yet contain everything. Tell us
          the song and, if you know it, where it is published.
        </Card>

        <Card title="A missing translation or word-by-word">
          Some songs still lack these. They are shown as absent rather than filled with placeholder
          text, and we are working through them.
        </Card>

        <Card title="A problem with the app">
          Anything that will not load, a recording that will not play, or text that renders
          incorrectly in your script. Please mention your device and which script you were reading
          in.
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">How to reach us</h2>

        {CONTACT_EMAIL ? (
          <p className="text-[var(--neutral)]">
            Write to{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[var(--highlight)] hover:underline font-medium"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        ) : (
          // No published address yet. Say so plainly rather than rendering a mailto: link to an
          // invented address that would silently swallow every message sent to it.
          <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--tertiary)] shadow-sm">
            <p className="text-[var(--neutral)]">
              A contact address for this edition has not been published yet. In the meantime,
              please use the contact details at{' '}
              <a
                href={PROJECT_SITE}
                className="text-[var(--highlight)] hover:underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                gaudiyakirtan.com
              </a>
              .
            </p>
          </div>
        )}
      </section>

      <p className="text-sm text-[var(--neutral)]">
        For what this collection is and where it comes from, see{' '}
        <Link href="/about" className="text-[var(--highlight)] hover:underline">
          About
        </Link>
        .
      </p>
    </div>
  </>
)

export default Contact
