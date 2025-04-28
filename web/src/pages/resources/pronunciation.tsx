import React from 'react'
import Head from 'next/head'
import { Layout } from '../../components/Layout'

const PronunciationPage = () => {
  return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">Pronunciation Guide</h1>
        
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Introduction to Sanskrit, Bengali, and Hindi Sounds</h2>
          <p className="mb-4 text-[var(--neutral)]">
            This pronunciation guide will help you correctly articulate the Sanskrit, Bengali, and Hindi 
            sounds that appear in the songs of the Gaudiya Vaishnava tradition. Proper pronunciation 
            enhances your spiritual practice and allows you to more deeply connect with the meaning 
            of these sacred songs.
          </p>
          <p className="mb-4 text-[var(--neutral)]">
            The transliteration system used in this collection employs diacritical marks to represent 
            sounds that don't exist in English or are pronounced differently.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Vowel Sounds</h2>
          
          <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-2">
            <div className="bg-[var(--background-offset)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Short Vowels</h3>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">a</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'u' in 'but', never like the 'a' in 'cat'.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Hari (huh-ri)</p>
              </div>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">i</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'i' in 'pin' or 'hit'.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Kṛṣṇa (krish-na)</p>
              </div>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">u</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'u' in 'put'.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Guru (gu-ru)</p>
              </div>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">ṛ</div>
                <p className="text-[var(--neutral)]">Pronounced like 'ri' in 'rip', with a slight trill of the 'r'.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Kṛṣṇa (krish-na)</p>
              </div>
            </div>
            
            <div className="bg-[var(--background-offset)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Long Vowels</h3>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">ā</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'a' in 'father', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Rādhā (raa-dhaa)</p>
              </div>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">ī</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'ee' in 'see', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Śrī (shree)</p>
              </div>
              <div className="mb-3">
                <div className="text-lg font-medium text-[var(--highlight)]">ū</div>
                <p className="text-[var(--neutral)]">Pronounced like the 'oo' in 'moon', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)]">Example: Bhū (bhoo)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Diphthongs (Compound Vowels)</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">e</div>
                  <p className="text-[var(--neutral)]">Pronounced like the 'a' in 'café' (not like the 'e' in 'bed').</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Prema (pray-ma)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ai</div>
                  <p className="text-[var(--neutral)]">Pronounced like the 'ai' in 'aisle' or 'high'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Caitanya (chye-tun-ya)</p>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">o</div>
                  <p className="text-[var(--neutral)]">Pronounced like the 'o' in 'go'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Govinda (go-vin-da)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">au</div>
                  <p className="text-[var(--neutral)]">Pronounced like the 'ow' in 'cow'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Gaurāṅga (gow-raang-ga)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Nasalized Vowels</h3>
            <p className="text-[var(--neutral)] mb-3">
              In Bengali and Hindi, vowels can be nasalized, meaning some air flows through the nose when 
              pronouncing them. This is indicated by a tilde (~) above the vowel in our transliteration system.
            </p>
            <div className="mb-3">
              <div className="text-lg font-medium text-[var(--highlight)]">ã, ā̃, ĩ, ī̃, etc.</div>
              <p className="text-[var(--neutral)]">Pronounced with a nasal quality, similar to the French "en" or Portuguese nasal sounds.</p>
              <p className="text-sm italic text-[var(--tertiary)]">Example: kā̃diya (kaan-di-ya)</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Consonant Sounds</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--primary)] mb-3">Consonant Categories</h3>
            <p className="text-[var(--neutral)] mb-4">
              Sanskrit consonants are organized by where they are pronounced in the mouth:
            </p>
            <ul className="list-disc list-inside text-[var(--neutral)] space-y-2 ml-4">
              <li><strong>Velar</strong>: Pronounced at the back of the mouth (k, kh, g, gh, ṅ)</li>
              <li><strong>Palatal</strong>: Pronounced at the hard palate (c, ch, j, jh, ñ)</li>
              <li><strong>Retroflex</strong>: Pronounced with the tongue curled back (ṭ, ṭh, ḍ, ḍh, ṇ)</li>
              <li><strong>Dental</strong>: Pronounced with the tongue against the teeth (t, th, d, dh, n)</li>
              <li><strong>Labial</strong>: Pronounced with the lips (p, ph, b, bh, m)</li>
            </ul>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Important Distinctions</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-[var(--primary)]">1. Aspirated vs. Non-aspirated Consonants</h4>
              <p className="text-[var(--neutral)] mb-2">
                A key distinction in Sanskrit is between aspirated consonants (those followed by an extra puff of air) 
                and non-aspirated consonants:
              </p>
              <ul className="list-disc list-inside text-[var(--neutral)] ml-4">
                <li><strong>Non-aspirated</strong>: k, g, c, j, ṭ, ḍ, t, d, p, b (minimal breath)</li>
                <li><strong>Aspirated</strong>: kh, gh, ch, jh, ṭh, ḍh, th, dh, ph, bh (with extra breath)</li>
              </ul>
              <p className="text-[var(--neutral)] mt-2">
                Think of the difference between the 'p' in 'spin' (non-aspirated) and the 'p' in 'pin' (aspirated).
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[var(--primary)]">2. Retroflex vs. Dental Consonants</h4>
              <p className="text-[var(--neutral)] mb-2">
                Another important distinction is between retroflex and dental consonants:
              </p>
              <ul className="list-disc list-inside text-[var(--neutral)] ml-4">
                <li><strong>Retroflex</strong> (ṭ, ṭh, ḍ, ḍh, ṇ): Pronounced with the tongue curled back to touch the roof of the mouth</li>
                <li><strong>Dental</strong> (t, th, d, dh, n): Pronounced with the tongue touching the upper teeth</li>
              </ul>
              <p className="text-[var(--neutral)] mt-2">
                English lacks this distinction, making it challenging for native English speakers.
              </p>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Special Consonants</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">c</div>
                  <p className="text-[var(--neutral)]">Always pronounced as 'ch' in 'church', never as 'k' or 's'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Caitanya (chye-tun-ya)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">j</div>
                  <p className="text-[var(--neutral)]">Always pronounced as 'j' in 'jump'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Jaya (ja-ya)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ĵ</div>
                  <p className="text-[var(--neutral)]">In Bengali, used for words that begin with 'y' in Sanskrit.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Ĵamunā (ja-mu-naa)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ñ</div>
                  <p className="text-[var(--neutral)]">Pronounced as 'n' in 'canyon'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Jñāna (gyaa-na)</p>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ś and ṣ</div>
                  <p className="text-[var(--neutral)]">Both pronounced as 'sh' in 'ship'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Śrī (shree), Kṛṣṇa (krish-na)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">h</div>
                  <p className="text-[var(--neutral)]">Pronounced as 'h' in 'home', but with more breath.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Hari (ha-ri)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ṃ (anusvāra)</div>
                  <p className="text-[var(--neutral)]">A pure nasal sound without closing the mouth.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Saṃsāra (sam-saa-ra)</p>
                </div>
                <div className="mb-3">
                  <div className="text-lg font-medium text-[var(--highlight)]">ḥ (visarga)</div>
                  <p className="text-[var(--neutral)]">A soft echo of the preceding vowel with a breathy 'h'.</p>
                  <p className="text-sm italic text-[var(--tertiary)]">Example: Duḥkha (duh-kha)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Common Bengali Pronunciation Features</h2>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Bengali Special Characters</h3>
            <div className="mb-3">
              <div className="text-lg font-medium text-[var(--highlight)]">õ</div>
              <p className="text-[var(--neutral)]">Represents the inherent vowel in Bengali, often pronounced like 'o' in 'sofa'.</p>
              <p className="text-sm italic text-[var(--tertiary)]">Example: Bôle (bo-le)</p>
            </div>
            <div className="mb-3">
              <div className="text-lg font-medium text-[var(--highlight)]">ũ, ĩ, ã</div>
              <p className="text-[var(--neutral)]">Nasalized versions of vowels, common in Bengali songs.</p>
              <p className="text-sm italic text-[var(--tertiary)]">Example: Gũthi (gun-thi)</p>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Pronunciation Variations</h3>
            <p className="text-[var(--neutral)] mb-3">
              Bengali often simplifies some Sanskrit sounds:
            </p>
            <ul className="list-disc list-inside text-[var(--neutral)] space-y-1 ml-4">
              <li>The three sibilants of Sanskrit (ś, ṣ, s) are all pronounced as 'sh' in Bengali</li>
              <li>The letter 'v' from Sanskrit is usually pronounced as 'b' in Bengali</li>
              <li>In Bengali, many words end with an inherent 'o' sound that is not written in standard transliteration</li>
              <li>Bengali often uses contractions marked with an apostrophe</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Practical Tips for Pronunciation</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-[var(--background-offset)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Tips for Beginners</h3>
              <ul className="list-disc list-inside text-[var(--neutral)] space-y-2 ml-2">
                <li>Listen to recordings of native speakers or experienced practitioners</li>
                <li>Practice slowly, focusing on one sound at a time</li>
                <li>Pay attention to the length of vowels (short vs. long)</li>
                <li>Be mindful of aspirated consonants vs. non-aspirated ones</li>
                <li>Remember that Sanskrit has a musical quality — each syllable receives roughly equal emphasis</li>
                <li>When in doubt, simplify rather than over-complicate</li>
              </ul>
            </div>
            
            <div className="bg-[var(--background-offset)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Common Pronunciation Mistakes</h3>
              <ul className="list-disc list-inside text-[var(--neutral)] space-y-2 ml-2">
                <li>Pronouncing 'a' as in 'cat' instead of 'but'</li>
                <li>Pronouncing 'e' as in 'get' instead of as in 'café'</li>
                <li>Not distinguishing between short and long vowels</li>
                <li>Failing to aspirate consonants that should be aspirated (kh, gh, etc.)</li>
                <li>Neglecting the retroflex sounds (ṭ, ḍ, etc.)</li>
                <li>Pronouncing 'c' as 'k' rather than 'ch'</li>
                <li>Skipping nasalization where required</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="p-4 text-center text-[var(--tertiary)] border-t border-[var(--border)]">
          <p>
            For a more thorough guide with audio examples and additional practice materials, 
            please visit: <a href="https://www.gaudiyakirtan.com/pronunciation" className="text-[var(--highlight)] hover:underline">www.gaudiyakirtan.com/pronunciation</a>
          </p>
        </div>
      </div>
  )
}

export default PronunciationPage