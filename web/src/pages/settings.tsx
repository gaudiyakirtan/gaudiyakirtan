import React from 'react'
import Head from 'next/head'
import { GetStaticProps } from 'next'
import { useSettings } from '../utils/SettingsContext'
import { ThemePreference, useTheme } from '../utils/ThemeContext'
import { getSongByUid } from '../services/songRepository'
import { IVerse } from '../models/Verse'
import { IScriptText } from '../models/Common'
import {
  pickScriptText,
  pickTranslation,
  pickWordToWord,
  resolveScriptLines,
} from '../services/textDisplay'
import { RomanStandard } from '../models/Settings'
import { ScriptCode } from '../models/Common'
import {
  DISPLAY_SCRIPT_OPTIONS,
  DISPLAY_SCRIPT_OPTIONS_WITH_AUTO,
  ROMAN_STANDARD_OPTIONS,
  TRANSLATION_LANGUAGE_OPTIONS,
  WORD_TO_WORD_LANGUAGE_OPTIONS,
  languageName,
  romanStandardName,
} from '../services/settingsOptions'
import { scriptOptionLabel, effectiveDisplayScript } from '../services/scripts'

interface SettingsPageProps {
  sample: {
    songUid: string
    languageOfOrigin: string
    titleMain: IScriptText[]
    authorDisplay: IScriptText[]
    verse: IVerse
  } | null
}

const selectClass =
  'w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--primary)] focus:border-[var(--highlight)] focus:outline-none disabled:opacity-40'

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-2xl border border-[var(--border)] bg-[var(--background-offset)] p-5">
    <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--neutral)]">{title}</h2>
    <div className="divide-y divide-[var(--border)]">{children}</div>
  </section>
)

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div className="min-w-0">
      <p className="text-sm text-[var(--primary)]">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--neutral)]">{hint}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
)

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'gaura', label: 'Gaura' },
  { value: 'shyam', label: 'Shyam' },
  { value: 'system', label: 'System' },
]

// One line of the sample verse (left, rendered exactly like the reader) beside the setting that
// controls it (right) — so the mapping is spatial, not labelled from afar.
const PreviewRow: React.FC<{ label: string; control: React.ReactNode; children: React.ReactNode }> = ({
  label,
  control,
  children,
}) => (
  <div className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[1fr_16rem] sm:items-center sm:gap-8">
    <div className="min-w-0">{children}</div>
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--neutral)]">{label}</p>
      {control}
    </div>
  </div>
)

// A script picker where "English (Roman / Latin)" reveals a secondary standard dropdown — the verse
// line it controls is just a transliteration, so it can be any script.
const ScriptControl: React.FC<{
  script: ScriptCode
  onScript: (s: ScriptCode) => void
  standard: RomanStandard
  onStandard: (s: RomanStandard) => void
  options?: ScriptCode[]
}> = ({ script, onScript, standard, onStandard, options = DISPLAY_SCRIPT_OPTIONS }) => (
  <div className="flex flex-wrap items-center gap-2">
    <select className={selectClass} value={script} onChange={(e) => onScript(e.target.value as ScriptCode)}>
      {options.map((s) => (
        <option key={s} value={s}>{scriptOptionLabel(s)}</option>
      ))}
    </select>
    {script === 'Latn' && (
      <select className={selectClass} value={standard} onChange={(e) => onStandard(e.target.value as RomanStandard)}>
        {ROMAN_STANDARD_OPTIONS.map((s) => (
          <option key={s} value={s}>{romanStandardName(s)}</option>
        ))}
      </select>
    )}
  </div>
)

const SettingsPage: React.FC<SettingsPageProps> = ({ sample }) => {
  const { settings, updateSetting } = useSettings()
  const { themePreference, setThemePreference } = useTheme()

  const verse = sample?.verse
  // Resolve `auto` ("Default (source language)") against the sample song's origin language.
  const effDisplayScript = effectiveDisplayScript(settings.displayScript, sample?.languageOfOrigin ?? 'ben')
  const sourceLines = verse ? resolveScriptLines(verse, effDisplayScript, settings.romanStandard) : undefined
  const transliterationLines = verse ? resolveScriptLines(verse, settings.transliterationScript, settings.romanStandard) : undefined
  const gloss = verse ? pickWordToWord(verse.wordToWords, settings.wordToWordLanguage) : undefined
  const translation = verse ? pickTranslation(verse.translations, settings.translationLanguage) : undefined
  const sampleTitle = sample ? pickScriptText(sample.titleMain, [settings.listLanguage, 'Latn', 'Beng']) : ''
  const sampleAuthor = sample ? pickScriptText(sample.authorDisplay, [settings.listLanguage, 'Latn', 'Beng']) : ''

  return (
    <>
      <Head>
        <title>Settings - Gaudiya Kirtan</title>
        <meta name="description" content="Display, appearance and app settings" />
      </Head>

      <div className="mx-auto w-full max-w-4xl pb-16">
        <h1 className="py-4 text-2xl font-bold text-[var(--primary)]">Settings</h1>

        {/* Language — the site-wide default. First and most prominent: it's the primary choice. */}
        <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--background-offset)] p-5 sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral)]">Language</h2>
          <p className="mt-1 text-sm text-[var(--neutral)]">
            The default language the whole app is shown in — song titles, author names, and every
            browse &amp; list screen. (The per-verse reading scripts are set under “Reading” below.)
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--primary)]">Display language</p>
              {sample && (
                <p className="mt-0.5 text-xs text-[var(--neutral)]">
                  e.g. “{sampleTitle}” — {sampleAuthor}
                </p>
              )}
            </div>
            <select
              className="w-64 max-w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--primary)] focus:border-[var(--highlight)] focus:outline-none"
              value={settings.listLanguage}
              onChange={(e) => updateSetting('listLanguage', e.target.value)}
            >
              {DISPLAY_SCRIPT_OPTIONS.map((s) => (
                <option key={s} value={s}>{scriptOptionLabel(s)}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Reading — a live sample verse rendered like the song page, each part beside its control */}
        <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--background-offset)] p-5 sm:p-6">
          <div className="mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral)]">Reading</h2>
          </div>

          {!sample || !verse ? (
            <p className="py-8 text-sm text-[var(--neutral)]">Sample verse unavailable.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {/* Source verse ↔ Display script (any script; English → standard) */}
              <PreviewRow
                label="Display script"
                control={
                  <ScriptControl
                    script={settings.displayScript}
                    onScript={(s) => updateSetting('displayScript', s)}
                    standard={settings.romanStandard}
                    onStandard={(s) => updateSetting('romanStandard', s)}
                    options={DISPLAY_SCRIPT_OPTIONS_WITH_AUTO}
                  />
                }
              >
                {sourceLines?.length ? (
                  sourceLines.map((line, i) => (
                    <p key={i} className="text-center text-sm text-[var(--neutral)] sm:text-left">{line}</p>
                  ))
                ) : (
                  <p className="text-center text-xs italic text-[var(--neutral)] sm:text-left">
                    This script isn’t available for this verse.
                  </p>
                )}
              </PreviewRow>

              {/* Transliteration ↔ any script (English → standard) */}
              <PreviewRow
                label="Transliteration"
                control={
                  <ScriptControl
                    script={settings.transliterationScript}
                    onScript={(s) => updateSetting('transliterationScript', s)}
                    standard={settings.romanStandard}
                    onStandard={(s) => updateSetting('romanStandard', s)}
                  />
                }
              >
                {transliterationLines?.map((line, i) => (
                  <p key={i} className="text-center text-base font-medium text-[var(--highlight)] sm:text-left">{line}</p>
                ))}
              </PreviewRow>

              {/* Word-by-word ↔ language (show/hide is toggled on the song page) */}
              <PreviewRow
                label="Word-by-word"
                control={
                  <select className={selectClass} value={settings.wordToWordLanguage}
                    onChange={(e) => updateSetting('wordToWordLanguage', e.target.value)}>
                    {WORD_TO_WORD_LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{languageName(l)}</option>)}
                  </select>
                }
              >
                {gloss && gloss.words.length ? (
                  <p className="text-sm leading-relaxed">
                    {gloss.words.map((pair, i) => (
                      <React.Fragment key={i}>
                        <span className="text-[var(--highlight)]">{pair[0]}</span>
                        <span className="text-[var(--primary)]"> — {pair[1]}</span>
                        {i < gloss.words.length - 1 && <span className="text-[var(--primary)]">; </span>}
                      </React.Fragment>
                    ))}
                  </p>
                ) : (
                  <p className="text-xs italic text-[var(--neutral)]">No glossary in this language for this verse.</p>
                )}
              </PreviewRow>

              {/* Translation ↔ language */}
              <PreviewRow
                label="Translation"
                control={
                  <select className={selectClass} value={settings.translationLanguage}
                    onChange={(e) => updateSetting('translationLanguage', e.target.value)}>
                    {TRANSLATION_LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{languageName(l)}</option>)}
                  </select>
                }
              >
                {translation && translation.text.length ? (
                  translation.text.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed text-[var(--primary)]">{line}</p>
                  ))
                ) : (
                  <p className="text-xs italic text-[var(--neutral)]">No translation in this language for this verse.</p>
                )}
              </PreviewRow>
            </div>
          )}
        </section>

        <div className="grid gap-6">
          {/* Appearance */}
          <Card title="Appearance">
            <Row label="Theme" hint="Gaura (light) / Shyam (dark)">
              <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--background)] p-0.5">
                {THEME_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setThemePreference(opt.value)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${themePreference === opt.value ? 'bg-[var(--highlight)] text-[var(--on-highlight)]' : 'text-[var(--neutral)] hover:text-[var(--primary)]'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Version"><span className="text-sm text-[var(--neutral)]">0.1.0</span></Row>
            <Row label="Corpus"><span className="text-sm text-[var(--neutral)]">702 songs, offline</span></Row>
          </Card>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<SettingsPageProps> = async () => {
  const song = getSongByUid('N9')
  const verse = song?.verses.find(
    (v) =>
      v.displayScripts?.some((d) => d.scriptCode === 'Beng') &&
      v.wordToWords?.some((w) => w.languageCode === 'eng') &&
      v.translations?.some((t) => t.languageCode === 'eng')
  )
  const sample = song && verse
    ? { songUid: song.uid, languageOfOrigin: song.languageOfOrigin, titleMain: song.titleMain, authorDisplay: song.authorDisplay, verse }
    : null
  return { props: { sample } }
}

export default SettingsPage
