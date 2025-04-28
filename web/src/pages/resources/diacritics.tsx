import React from 'react'

const DiacriticsPage = () => {
  return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">The Sounds of Sanskrit, Bengali and Hindi</h1>
        <p className="mb-4 text-[var(--neutral)]">
          In the charts below, both Bengali and Hindi are pronounced as
          they are in Sanskrit, except where otherwise noted.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Vowels</h2>
          <div className="overflow-x-auto">
            <table className="w-full mb-6 border-collapse">
              <thead>
                <tr className="bg-[var(--background-offset)]">
                  <th className="border border-[var(--border)] p-2 text-left">Sanskrit Pronunciation</th>
                  <th className="border border-[var(--border)] p-2 text-left">Bengali Pronunciation</th>
                  <th className="border border-[var(--border)] p-2 text-left">Hindi Pronunciation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>a</strong> – as in 'about'
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    pronounced in two ways: a as in the British pronunciation of hot<sup>1</sup> or ô as in 'sofa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ā</strong> – as in 'father'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>i</strong> – as in 'see'
                  </td>
                  <td className="border border-[var(--border)] p-2">as in 'hit'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ī</strong> – as in 'see' but pronounced longer
                  </td>
                  <td className="border border-[var(--border)] p-2">same as 'i'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>u</strong> – as in 'mood'
                  </td>
                  <td className="border border-[var(--border)] p-2">as in 'put'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ū</strong> – as in 'mood' but pronounced longer
                  </td>
                  <td className="border border-[var(--border)] p-2">same as 'u'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ṛ</strong> – as in 'rip' and sometimes as in 'reed' (the 'r' sound should be slightly trilled)
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>e</strong> – as in French 'café'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ai</strong> – as in 'high'
                  </td>
                  <td className="border border-[var(--border)] p-2">as in 'boy'</td>
                  <td className="border border-[var(--border)] p-2">as in 'hen'</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>o</strong> – as in 'sofa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>au</strong> – as in 'now'
                  </td>
                  <td className="border border-[var(--border)] p-2">the sounds 'o' and 'u' joined together</td>
                  <td className="border border-[var(--border)] p-2">the sounds 'a' and 'u' joined together</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Consonants</h2>
          <p className="mb-4 text-[var(--neutral)]">
            The Sanskrit alphabet is grouped according to the place of
            articulation in the mouth.
          </p>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--background-offset)]">
                  <th className="border border-[var(--border)] p-2 text-left">Sanskrit</th>
                  <th className="border border-[var(--border)] p-2 text-left">Bengali</th>
                  <th className="border border-[var(--border)] p-2 text-left">Hindi</th>
                </tr>
              </thead>
              <tbody>
                {/* Velar section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Velar</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ka</strong> – as in 'skit'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>kha</strong> – aspirated form of 'ka'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ga</strong> – as in 'god'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>gha</strong> – aspirated form of 'ga'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ṅ</strong> – as in 'ink'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Palatal section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Palatal</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ca</strong> – as in 'cheap'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>cha</strong> – aspirated form of 'ca'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ja</strong> – as in 'joke'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>jha</strong> – aspirated form of 'ja'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ñ</strong> – as in 'inch'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Retroflex section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Retroflex</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ṭa</strong> – as in 'train' but harder
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ṭha</strong> – aspirated form of 'ṭa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ḍa</strong> – as in 'drain' but harder
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ḍha</strong> – aspirated form of 'ḍa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ḓa</strong> – a hard 'r' – the tongue makes a 'ḍa' sound as it moves past the palate.<sup>2</sup>
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ḓha</strong> – aspirated form of 'ḓa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Dental section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Dental</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ta</strong> – as in 'at' with the phrase 'at the'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>tha</strong> – aspirated form of 'ta'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>da</strong> – as in 'breadth'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>dha</strong> – aspirated form of 'da'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>na</strong> – as in 'anthem'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Labial section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Labial</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>pa</strong> – as in 'spin'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>pha</strong> – aspirated form of 'pa'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2">
                    pronounced somewhere in between 'pha' and 'fa'
                  </td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ba</strong> – as in 'bin'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>bha</strong> – aspirated form of 'ba'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ma</strong> – as in 'mom'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Semivowels section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Semivowels</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ya</strong> – as in 'yet'
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    if this consonant begins a Bengali word it is written 'ĵa' – as in 'joke'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ra</strong> – as in 'Rome' (the 'r' sound should be slightly trilled)
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>la</strong> – as in 'loud'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>va</strong> – as in 'vest'
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    this consonant doesn't appear in the Bengali alphabet
                  </td>
                  <td className="border border-[var(--border)] p-2">
                    pronounced somewhere in between 'vest' and 'west'
                  </td>
                </tr>

                {/* Sibilants section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Sibilants</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>śa</strong> – as in 'ship'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ṣa</strong> – retroflex form of 'śa'
                  </td>
                  <td className="border border-[var(--border)] p-2">same as 'śa'</td>
                  <td className="border border-[var(--border)] p-2">same as 'śa'</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>sa</strong> – as in 'sip'
                  </td>
                  <td className="border border-[var(--border)] p-2">same as 'śa'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>

                {/* Aspirate section */}
                <tr className="bg-[var(--background-offset)] font-medium">
                  <td className="border border-[var(--border)] p-2" colSpan={3}>Aspirate</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>ha</strong> – as in 'hip'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>kṣa</strong> – as in 'section'
                  </td>
                  <td className="border border-[var(--border)] p-2">same as 'kha'</td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
                <tr>
                  <td className="border border-[var(--border)] p-2">
                    <strong>jña</strong> – pronounced as 'gya'
                  </td>
                  <td className="border border-[var(--border)] p-2"></td>
                  <td className="border border-[var(--border)] p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Challenges for English Speakers</h2>
          <p className="mb-4 text-[var(--neutral)]">
            The challenge in pronouncing Sanskrit, Bengali, and Hindi is in
            differentiating between the non-aspirated and aspirated forms
            of consonants and between retroflex and dental consonants.
            In English our pronunciation is somewhere in between both of
            these. Another challenge is in pronouncing nasal sounds.
          </p>

          <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Aspirated and Non-aspirated</h3>
          <p className="mb-4 text-[var(--neutral)]">
            The non-aspirated consonants—ka, ga, ca, ja, ṭa, ḍa, ta, da, and pa—
            are pronounced with minimal breath.
          </p>
          <p className="mb-4 text-[var(--neutral)]">
            The aspirated consonants—kha, gha, cha, jha, ṭha, ḍha, tha,
            dha, and pha—are pronounced while releasing the breath, as in
            'brick-house', 'dog-house', 'pitch-hook' etc.
          </p>

          <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Retroflex and Dental</h3>
          <p className="mb-4 text-[var(--neutral)]">
            Retroflex sounds are more hard and they are made by making a
            'ta', 'da,' or 'na' sound by curling the tongue back to touch the roof
            of the mouth in the center.
          </p>
          <p className="mb-4 text-[var(--neutral)]">
            Dental sounds are more soft and they are made by making a 'ta',
            'da,' or 'na' sound by touching the tongue to the top of the teeth.
          </p>

          <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">Nasals</h3>
          <p className="mb-4 text-[var(--neutral)]">
            All the vowels in Bengali and Hindi, except for 'ṛ', can be nasalized.
            This is done by diverting some of the breath to the nose. You
            can easily make the sound by pinching your nose! In our
            transliteration, this is represented with a tilde (~) above the letter
            (eg. kā̃diya).
          </p>
        </section>

        <div className="p-4 text-center text-[var(--tertiary)] border-t border-[var(--border)]">
          <p>
            <sup>1</sup> 'Ḓa' is the most difficult sound for English speakers to make but it may be
            substituted with the American pronunciation of tt in 'butter.'
          </p>
        </div>
      </div>
  )
}

export default DiacriticsPage