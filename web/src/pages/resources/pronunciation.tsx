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
            <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--accent)] shadow-sm">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Short Vowels</h3>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--accent)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">a</div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'u' in 'but', never like the 'a' in 'cat'.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">H<span className="text-[var(--accent)]">a</span>ri</span> (huh-ri)</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--royal-blue)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">i</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--royal-blue)] to-transparent"></div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'i' in 'pin' or 'hit'.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">Kṛṣṇa</span> (kr<span className="text-[var(--royal-blue)]">i</span>sh-na)</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--green)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">u</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--green)] to-transparent"></div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'u' in 'put'.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">G<span className="text-[var(--green)]">u</span>r<span className="text-[var(--green)]">u</span></span> (g<span className="text-[var(--green)]">u</span>-r<span className="text-[var(--green)]">u</span>)</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--red)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">ṛ</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--red)] to-transparent"></div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like 'ri' in 'rip', with a slight trill of the 'r'.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">K<span className="text-[var(--red)]">ṛ</span>ṣṇa</span> (k<span className="text-[var(--red)]">ri</span>sh-na)</p>
              </div>
            </div>
            
            <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--highlight)] shadow-sm">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Long Vowels</h3>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--tertiary)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">ā</div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'a' in 'father', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">R<span className="text-[var(--accent)]">ā</span>dh<span className="text-[var(--accent)]">ā</span></span> (r<span className="text-[var(--accent)]">aa</span>-dh<span className="text-[var(--accent)]">aa</span>)</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--royal-blue)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">ī</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--royal-blue)] to-transparent"></div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'ee' in 'see', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">Śr<span className="text-[var(--royal-blue)]">ī</span></span> (shr<span className="text-[var(--royal-blue)]">ee</span>)</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center">
                  <div className="text-xl font-medium text-[var(--green)] bg-[var(--background)] px-3 py-1 rounded-lg mr-2 shadow-sm">ū</div>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--green)] to-transparent"></div>
                </div>
                <p className="text-[var(--neutral)] mt-2">Pronounced like the 'oo' in 'moon', held longer.</p>
                <p className="text-sm italic text-[var(--tertiary)] bg-[var(--background)] p-2 rounded mt-1">Example: <span className="font-medium">Bh<span className="text-[var(--green)]">ū</span></span> (bh<span className="text-[var(--green)]">oo</span>)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 mb-6 border-l-4 border-[var(--purple)] shadow-sm">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Diphthongs (Compound Vowels)</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--purple)] px-3 py-1 rounded-lg mr-2 border border-[var(--purple)]">e</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--purple)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced like the 'a' in 'café' (not like the 'e' in 'bed').</p>
                  <p className="mt-1 text-sm italic">Example: <span className="font-medium text-[var(--tertiary)]">Pr<span className="text-[var(--purple)]">e</span>ma</span> (pr<span className="text-[var(--purple)]">ay</span>-ma)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--purple)] px-3 py-1 rounded-lg mr-2 border border-[var(--purple)]">ai</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--purple)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced like the 'ai' in 'aisle' or 'high'.</p>
                  <p className="mt-1 text-sm italic">Example: <span className="font-medium text-[var(--tertiary)]">C<span className="text-[var(--purple)]">ai</span>tanya</span> (ch<span className="text-[var(--purple)]">ye</span>-tun-ya)</p>
                </div>
              </div>
              <div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--purple)] px-3 py-1 rounded-lg mr-2 border border-[var(--purple)]">o</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--purple)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced like the 'o' in 'go'.</p>
                  <p className="mt-1 text-sm italic">Example: <span className="font-medium text-[var(--tertiary)]">G<span className="text-[var(--purple)]">o</span>vinda</span> (g<span className="text-[var(--purple)]">o</span>-vin-da)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--purple)] px-3 py-1 rounded-lg mr-2 border border-[var(--purple)]">au</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--purple)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced like the 'ow' in 'cow'.</p>
                  <p className="mt-1 text-sm italic">Example: <span className="font-medium text-[var(--tertiary)]">G<span className="text-[var(--purple)]">au</span>rāṅga</span> (g<span className="text-[var(--purple)]">ow</span>-raang-ga)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--blue)] shadow-sm">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Nasalized Vowels</h3>
            <p className="text-[var(--neutral)] mb-3">
              In Bengali and Hindi, vowels can be nasalized, meaning some air flows through the nose when 
              pronouncing them. This is indicated by a tilde (~) above the vowel in our transliteration system.
            </p>
            <div className="bg-[var(--background)] p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ã</span>
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ā̃</span>
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ĩ</span>
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ī̃</span>
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ũ</span>
                <span className="text-xl font-medium text-[var(--blue)] mx-1 px-2 py-1 border border-[var(--border)] rounded">ū̃</span>
              </div>
              <p className="text-[var(--neutral)] mb-2">Pronounced with a nasal quality, similar to the French "en" or Portuguese nasal sounds.</p>
              <div className="p-3 bg-[var(--background-offset)] rounded-lg">
                <p className="text-base italic">Example: <span className="font-medium">k<span className="text-[var(--blue)]">ā̃</span>diya</span> (k<span className="text-[var(--blue)]">aan</span>-di-ya)</p>
                <p className="text-sm text-[var(--tertiary)] mt-1">To practice: Try saying "ah" while gently humming through your nose at the same time.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--primary)] mb-4">Consonant Sounds</h2>
          
          <div className="mb-6 bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--accent)] shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Consonant Categories</h3>
            <p className="text-[var(--neutral)] mb-4">
              Sanskrit consonants are organized by where they are pronounced in the mouth:
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-[var(--accent)]">Velar <span className="text-[var(--neutral)] text-sm">(Back of mouth)</span></h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">k</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">kh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">g</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">gh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ṅ</span>
                </div>
              </div>
              
              <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-[var(--highlight)]">Palatal <span className="text-[var(--neutral)] text-sm">(Hard palate)</span></h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">c</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ch</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">j</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">jh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ñ</span>
                </div>
              </div>
              
              <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-[var(--royal-blue)]">Retroflex <span className="text-[var(--neutral)] text-sm">(Tongue curled back)</span></h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ṭ</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ṭh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ḍ</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ḍh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ṇ</span>
                </div>
              </div>
              
              <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-[var(--red)]">Dental <span className="text-[var(--neutral)] text-sm">(Against teeth)</span></h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">t</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">th</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">d</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">dh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">n</span>
                </div>
              </div>
              
              <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
                <h4 className="font-medium text-[var(--green)]">Labial <span className="text-[var(--neutral)] text-sm">(With lips)</span></h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">p</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">ph</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">b</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">bh</span>
                  <span className="px-2 py-1 bg-[var(--highlight-transparent)] rounded font-medium">m</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 mb-6 border-l-4 border-[var(--highlight)] shadow-sm">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Important Distinctions</h3>
            
            <div className="mb-4 bg-[var(--background)] p-3 rounded-lg shadow-sm">
              <h4 className="font-medium text-[var(--primary)] mb-2 border-b border-[var(--border)] pb-1">1. Aspirated vs. Non-aspirated Consonants</h4>
              <p className="text-[var(--neutral)] mb-2">
                A key distinction in Sanskrit is between aspirated consonants (those followed by an extra puff of air) 
                and non-aspirated consonants:
              </p>
              
              <div className="grid grid-cols-1 gap-3 mb-2 md:grid-cols-2">
                <div className="bg-[var(--background-offset)] p-2 rounded-lg">
                  <h5 className="font-medium text-[var(--accent)]">Non-aspirated <span className="text-[var(--neutral)] text-sm">(minimal breath)</span></h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">k</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">g</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">c</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">j</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ṭ</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ḍ</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">t</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">d</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">p</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">b</span>
                  </div>
                </div>
                
                <div className="bg-[var(--background-offset)] p-2 rounded-lg">
                  <h5 className="font-medium text-[var(--highlight)]">Aspirated <span className="text-[var(--neutral)] text-sm">(with extra breath)</span></h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">kh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">gh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ch</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">jh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ṭh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ḍh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">th</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">dh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ph</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">bh</span>
                  </div>
                </div>
              </div>
              
              <p className="text-[var(--neutral)] mt-2 bg-[var(--background-offset)] p-2 rounded-lg">
                <span className="font-medium">Example:</span> Think of the difference between the 'p' in 'spin' (non-aspirated) and the 'p' in 'pin' (aspirated).
              </p>
            </div>
            
            <div className="bg-[var(--background)] p-3 rounded-lg shadow-sm">
              <h4 className="font-medium text-[var(--primary)] mb-2 border-b border-[var(--border)] pb-1">2. Retroflex vs. Dental Consonants</h4>
              <p className="text-[var(--neutral)] mb-2">
                Another important distinction is between retroflex and dental consonants:
              </p>
              
              <div className="grid grid-cols-1 gap-3 mb-2 md:grid-cols-2">
                <div className="bg-[var(--background-offset)] p-2 rounded-lg">
                  <h5 className="font-medium text-[var(--royal-blue)]">Retroflex <span className="text-[var(--neutral)] text-sm">(tongue curled back)</span></h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ṭ</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ṭh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ḍ</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ḍh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">ṇ</span>
                  </div>
                </div>
                
                <div className="bg-[var(--background-offset)] p-2 rounded-lg">
                  <h5 className="font-medium text-[var(--red)]">Dental <span className="text-[var(--neutral)] text-sm">(tongue against teeth)</span></h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">t</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">th</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">d</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">dh</span>
                    <span className="px-2 py-1 bg-[var(--background)] rounded font-medium">n</span>
                  </div>
                </div>
              </div>
              
              <p className="text-[var(--neutral)] mt-2 bg-[var(--background-offset)] p-2 rounded-lg">
                <span className="font-medium">Note:</span> English lacks this distinction, making it challenging for native English speakers.
              </p>
            </div>
          </div>
          
          <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--orange)] shadow-sm">
            <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Special Consonants</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--orange)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">c</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--orange)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Always pronounced as 'ch' in 'church', never as 'k' or 's'.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]"><span className="text-[var(--orange)]">C</span>aitanya</span> (<span className="text-[var(--orange)]">ch</span>ye-tun-ya)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--orange)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">j</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--orange)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Always pronounced as 'j' in 'jump'.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]"><span className="text-[var(--orange)]">J</span>aya</span> (<span className="text-[var(--orange)]">j</span>a-ya)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--orange)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">ĵ</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--orange)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">In Bengali, used for words that begin with 'y' in Sanskrit.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]"><span className="text-[var(--orange)]">Ĵ</span>amunā</span> (<span className="text-[var(--orange)]">j</span>a-mu-naa)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--orange)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">ñ</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--orange)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced as 'n' in 'canyon'.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]">J<span className="text-[var(--orange)]">ñ</span>āna</span> (<span className="text-[var(--orange)]">gy</span>aa-na)</p>
                </div>
              </div>
              <div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--orange)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">ś ṣ</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--orange)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Both pronounced as 'sh' in 'ship'.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Examples: <span className="font-medium text-[var(--primary)]"><span className="text-[var(--orange)]">Ś</span>rī</span> (<span className="text-[var(--orange)]">sh</span>ree), <span className="font-medium text-[var(--primary)]">Kṛ<span className="text-[var(--orange)]">ṣ</span>ṇa</span> (kri<span className="text-[var(--orange)]">sh</span>-na)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--blue)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">h</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--blue)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">Pronounced as 'h' in 'home', but with more breath.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]"><span className="text-[var(--blue)]">H</span>ari</span> (<span className="text-[var(--blue)]">h</span>a-ri)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--blue)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">ṃ</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--blue)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">A pure nasal sound (anusvāra) without closing the mouth.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]">Sa<span className="text-[var(--blue)]">ṃ</span>sāra</span> (sa<span className="text-[var(--blue)]">m</span>-saa-ra)</p>
                </div>
                <div className="mb-3 bg-[var(--background)] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="text-xl font-medium text-[var(--blue)] bg-[var(--highlight-transparent)] px-3 py-1 rounded-lg mr-2 shadow-sm">ḥ</div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--blue)] to-transparent"></div>
                  </div>
                  <p className="text-[var(--neutral)] mt-2">A soft echo (visarga) of the preceding vowel with a breathy 'h'.</p>
                  <p className="text-sm italic bg-[var(--background-offset)] p-2 rounded mt-1">Example: <span className="font-medium text-[var(--primary)]">Du<span className="text-[var(--blue)]">ḥ</span>kha</span> (du<span className="text-[var(--blue)]">h</span>-kha)</p>
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
            <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--green)] shadow-sm">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Tips for Beginners</h3>
              <div className="bg-[var(--background)] p-3 rounded-lg">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">Listen to recordings of native speakers or experienced practitioners</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">Practice slowly, focusing on one sound at a time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">Pay attention to the length of vowels (short vs. long)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">Be mindful of aspirated consonants vs. non-aspirated ones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">Remember that Sanskrit has a musical quality — each syllable receives roughly equal emphasis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--green)] mr-2 text-white text-xs font-bold mt-0.5">✓</span>
                    <span className="text-[var(--neutral)]">When in doubt, simplify rather than over-complicate</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-[var(--background-offset)] rounded-lg p-4 border-l-4 border-[var(--red)] shadow-sm">
              <h3 className="font-semibold text-[var(--primary)] border-b border-[var(--border)] pb-2 mb-3">Common Pronunciation Mistakes</h3>
              <div className="bg-[var(--background)] p-3 rounded-lg">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Pronouncing 'a' as in 'cat' instead of 'but'</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Pronouncing 'e' as in 'get' instead of as in 'café'</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Not distinguishing between short and long vowels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Failing to aspirate consonants that should be aspirated (kh, gh, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Neglecting the retroflex sounds (ṭ, ḍ, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Pronouncing 'c' as 'k' rather than 'ch'</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--red)] mr-2 text-white text-xs font-bold mt-0.5">✕</span>
                    <span className="text-[var(--neutral)]">Skipping nasalization where required</span>
                  </li>
                </ul>
              </div>
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