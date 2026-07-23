import React from 'react'

const VerseMetersPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <h1 className="text-2xl font-bold text-[var(--primary)] mb-6">
        Verse Meter Guide
      </h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">
          Bengali Verse Meter
        </h2>
        <p className="mb-4 text-[var(--neutral)]">
          There are many different meters used in Bengali verses, but three are
          prominent. That means if you learn even one melody for each of these
          meters, you can sing most of the Bengali kīrtanas in this songbook.
        </p>

        {/* Fourteen syllable line of two divisions (Payār) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Fourteen syllable line of two divisions (Payār)
          </h3>
          <div className="p-4 mb-4 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">14 syllables</span>
            </div>
            <div className="mb-2">
              <span className="border-b border-[var(--primary)]">
                1st div (8 syllables)
              </span>{" "}
              <span className="border-b border-[var(--primary)]">
                2nd div (6 syllables)
              </span>
            </div>
            <div className="mb-2 overflow-x-auto">
              <table className="w-full border-collapse bg-[var(--background)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-2 text-center" colSpan={8}>
                      1st division (8 syllables)
                    </th>
                    <th className="p-2 text-center" colSpan={6}>
                      2nd division (6 syllables)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        gau
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        rāṅ
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        ga
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">bô</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        li
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        te
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                      <span className="text-[var(--orange)] font-medium">
                        ha'
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--blue)] font-medium">be</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        pu
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        la
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        ka
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">śa</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        rī
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        ra
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                      7
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                      8
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 mb-2">
              <p className="text-[var(--primary)] mb-2 font-medium">
                Another example:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-[var(--background)]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="p-2 text-center" colSpan={14}>
                        Complete line (14 syllables)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          'ha
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ri
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          ha
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          ri'
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          bô
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          li
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--orange)] font-medium">
                          te
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--blue)] font-medium">
                          na
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--dark-purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--dark-purple)] font-medium">
                          ya
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--dark-green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--dark-green)] font-medium">
                          ne
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red-orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red-orange)] font-medium">
                          ba'
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--light-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--light-blue)] font-medium">
                          be
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--gray)] bg-[var(--background-offset)]">
                        <span className="text-[var(--gray)] font-medium">
                          nī
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ra
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        1
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        2
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        3
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        4
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        5
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        6
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                        7
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                        8
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--dark-purple)] text-white">
                        9
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--dark-green)] text-white">
                        10
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red-orange)] text-white">
                        11
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--light-blue)] text-white">
                        12
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--gray)] text-white">
                        13
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        14
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-[var(--primary)] mb-1">
                Songs in this meter:
              </h4>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Akrodha Paramānanda</li>
                <li>Āmāra' Bôlite Prabhu!</li>
                <li>Āmāra Samāna Hīna</li>
                <li>Āśraya Kôriyā Vandõ</li>
                <li>Bhavārṇave Paḓe' Mora</li>
                <li>Durlabha Mānava-janma</li>
                <li>E'lo Gaura-rasa-nadī</li>
                <li>Ei-bāra Karuṇā Karô</li>
                <li>Ekhôna Bujhinu Prabhu!</li>
                <li>'Gaurāṅga' Bôlite Ha'be</li>
                <li>Gaurāṅga Tumi More</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Gorā Pahũ Nā Bhajiyā Mainu</li>
                <li>Hari Bôle Moder Gaura Elo</li>
                <li>(Hari) Haraye Namah Kṛṣṇa</li>
                <li>Hari Hari! Kabe Ha'bô Vṛndāvana-vāsī</li>
                <li>Hari Hari! Kabe Mora Hôibe Sudina?</li>
                <li>Hari He Dayāla Mora</li>
                <li>Jaya Jaya Advaita Ācārya Dayāmaya</li>
                <li>Jaya Jaya Gadādhara Paṇḍita Gosā̃i</li>
                <li>Jaya Jaya Jagannātha Śacīra-nandana</li>
                <li>Jaya Jaya Nityānanda Rohiṇī-kumāra</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Ĵe Ānilô Prema-dhana</li>
                <li>Jīva Jāgô, Jīva Jāgô</li>
                <li>Kabe Śrī Caitanya More</li>
                <li>Ke Jābi Ke Jābi Bhāi</li>
                <li>Ki-rūpe Pāibô Sevā</li>
                <li>Nadīyā-godrume</li>
                <li>Nadīyāra Ghāṭe Bhāi</li>
                <li>Nagara Bhramiyā Āmāra</li>
                <li>Nitāi Guṇa-maṇi</li>
                <li>Nitāi Mora Jīvana-dhana</li>
                <li>Nivedana Kôri Prabhu!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Short line of three divisions (Laghu Tripadī) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Short line of three divisions (Laghu Tripadī)
          </h3>
          <div className="p-4 mb-4 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">20 syllables</span>
            </div>
            <div className="mb-2">
              <span className="border-b border-[var(--primary)]">
                1st div (6 syllables)
              </span>{" "}
              <span className="border-b border-[var(--primary)]">
                2nd div (6 syllables)
              </span>{" "}
              <span className="border-b border-[var(--primary)]">
                3rd div (8 syllables)
              </span>
            </div>
            <div className="mb-2 overflow-x-auto">
              <table className="w-full border-collapse bg-[var(--background)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-2 text-center" colSpan={6}>
                      1st division (6 syllables)
                    </th>
                    <th className="p-2 text-center" colSpan={6}>
                      2nd division (6 syllables)
                    </th>
                    <th className="p-2 text-center" colSpan={8}>
                      3rd division (8 syllables)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        kṛ
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        pā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        -bin
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">du</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        di
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        yā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        ka
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        rô
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        e
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">i</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        dā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        se
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        tṛ
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        ṇā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        pe
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">kṣā</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">a</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        ti
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                      <span className="text-[var(--orange)] font-medium">
                        hī
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--blue)] font-medium">na</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                      7
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                      8
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 mb-2">
              <p className="text-[var(--primary)] mb-2 font-medium">
                Another example:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-[var(--background)]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="p-2 text-center" colSpan={20}>
                        Complete line (20 syllables)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          sa
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ka
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          la
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          -sa
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          ha
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          ne
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ba
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          la
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          di
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          ya
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          ka
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          rô
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ni
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ja
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          -mā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          ne
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          spṛ
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          hā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--orange)] font-medium">
                          -hī
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--blue)] font-medium">
                          na
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        1
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        2
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        3
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        4
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        5
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        6
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        7
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        8
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        9
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        10
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        11
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        12
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        13
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        14
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        15
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        16
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        17
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        18
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                        19
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                        20
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={6}
                      >
                        First division (6 syllables)
                      </td>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={6}
                      >
                        Second division (6 syllables)
                      </td>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={8}
                      >
                        Third division (8 syllables)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-[var(--primary)] mb-1">
                Songs in this meter:
              </h4>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Āmāra Jīvana</li>
                <li>Ātma-nivedana</li>
                <li>Avatāra-sāra</li>
                <li>Bhajô Bhajô Hari</li>
                <li>Cintāmaṇi-maya</li>
                <li>Dekhite Dekhite</li>
                <li>E Ghora-saṁsāre</li>
                <li>Emôna Gaurāṅga Binā Nāhi Āra</li>
                <li>Emôna Śacīra Nandana Bine</li>
                <li>Gopīnāth, Āmāra Upāya Nāi</li>
                <li>Gopīnāth, Ghucāo Saṁsāra-jvālā</li>
                <li>Gopīnāth, Mama Nivedana Śunô</li>
                <li>Gurudeva! Baḓô Kṛpā Kôri</li>
                <li>Gurudeva! Kabe Mora Sei Dina Ha'be?</li>
                <li>Gurudeva! Kabe Tava Karuṇā Prakāśe</li>
                <li>Gurudeva! Kṛpā-bindu Diyā</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Hā Hā Kabe Gaura-Nitāi</li>
                <li>Hā Hā Mora Gaura-Kiśora</li>
                <li>Hari Hari! Kabe Mora Habe Henô Dina</li>
                <li>Hari He! Arthera Sañcaye</li>
                <li>Hari He! Bhajane Utsāha</li>
                <li>Hari He! Dāna-pratigraha</li>
                <li>Hari He! Nīra-dharma-gata</li>
                <li>Hari He! Prapañce Pôḓiyā</li>
                <li>Hari He! Saṅga-doṣa-śūnya</li>
                <li>Hari He! Śrī Rūpa Gosā̃i</li>
                <li>Hari He! Tomāre Bhuliyā</li>
                <li>Harināma Tuwā Aneka Svarūpa</li>
                <li>(Ĵadi) Gaurāṅga Nahito</li>
                <li>Jaya Jaya Śrī Guru</li>
                <li>Kabe Āhā Gaurāṅga Bôliyā</li>
                <li>Kabe Gaura-vane</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Kabe Ha'be Henô Daśā Mora</li>
                <li>Kabe Muĩ Vaiṣṇava Cinibô</li>
                <li>Ki Jāni Ki Bale</li>
                <li>Kṛpā Karô Vaiṣṇava Ṭhākura</li>
                <li>Mana Re! Kahô Nā Gaura Kathā</li>
                <li>Nārada Muni</li>
                <li>Nitāi-Gaura-nāma</li>
                <li>Ohe! Vaiṣṇava Ṭhākura</li>
                <li>Pālya-dāsī Kôri'</li>
                <li>Parama Karuṇa</li>
                <li>Pīta-varaṇa Kali-pāvana Gorā</li>
                <li>Prabhu He! Emôna Durmati</li>
                <li>Prabhu Tava Pada-ĵuge</li>
                <li>Ramaṇī-śiromaṇi</li>
                <li>Sarvasva Tomāra</li>
                <li>Śrī Kṛṣṇa-virahe</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Śuddha-bhakata</li>
                <li>Vrajendra-nandana</li>
                <li>Vṛṣabhānu-sutā</li>
                <li>Yamunā-puline</li>
                <li>Rādhā-Kṛṣṇa Prāṇa Mora</li>
                <li>Sakala Vaiṣṇava Gosā̃i</li>
                <li>Śrī Gaura Ārati</li>
                <li>Śrī Hari-vāsare Hari-kīrtana-vidhāna</li>
                <li>Śrī Ĵugala Ārati</li>
                <li>Śrī Kṛṣṇa Caitanya Prabhu Dayā Karô</li>
                <li>Śrī Kṛṣṇa-Caitanya Prabhu Jīve Dayā</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Śrī Kṛṣṇa-kīrtane Ĵadi</li>
                <li>Śrī Madhyāhna Bhoga Ārati</li>
                <li>Śrī Maṅgala Ārati</li>
                <li>Śrī Paramgurudeva-ārati</li>
                <li>Śrī Tulasī Parikramā and Ārati (2)</li>
                <li>Śrīla Prabhupāda-ārati</li>
                <li>Śuniyāchi Sādhu-mukhe</li>
                <li>Tuhũ Dayā-sāgara</li>
                <li>Tumi Sarveśvareśvara</li>
                <li>Tuwā Bhakti-ānukūla</li>
                <li>Tuwā Bhakti-pratikūla</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Viṣaya-vāsanā-rūpa</li>
                <li>Vṛndāvana-vāsī Ĵatô</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Long line of three divisions (Dīrgha Tripadī) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Long line of three divisions (Dīrgha Tripadī)
          </h3>
          <div className="p-4 mb-4 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">26 syllables</span>
            </div>
            <div className="mb-2">
              <span className="border-b border-[var(--primary)]">
                1st div (6 syllables)
              </span>{" "}
              <span className="border-b border-[var(--primary)]">
                2nd div (6 syllables)
              </span>{" "}
              <span className="border-b border-[var(--primary)]">
                3rd div (10 syllables)
              </span>
            </div>
            <div className="mb-2 overflow-x-auto">
              <table className="w-full border-collapse bg-[var(--background)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-2 text-center" colSpan={8}>
                      1st division (8 syllables)
                    </th>
                    <th className="p-2 text-center" colSpan={8}>
                      2nd division (8 syllables)
                    </th>
                    <th className="p-2 text-center" colSpan={10}>
                      3rd division (10 syllables)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        śrī
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        gu
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        ru
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">-ca</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        ra
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        ṇa
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                      <span className="text-[var(--orange)] font-medium">
                        -pad
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--blue)] font-medium">ma</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        ke
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        va
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        la
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">bha</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        ka
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        ti
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                      <span className="text-[var(--orange)] font-medium">
                        -sad
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--blue)] font-medium">ma</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        van
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                      <span className="text-[var(--primary)] font-medium">
                        do
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--royal-blue)] font-medium">
                        mu
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                      <span className="text-[var(--red)] font-medium">ĩ</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--green)] font-medium">
                        sā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--purple)] font-medium">
                        va
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                      <span className="text-[var(--orange)] font-medium">
                        dhā
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                      <span className="text-[var(--blue)] font-medium">na</span>
                    </td>
                    <td className="p-2 text-center border border-[var(--dark-purple)] bg-[var(--background-offset)]">
                      <span className="text-[var(--dark-purple)] font-medium">
                        -ma
                      </span>
                    </td>
                    <td className="p-2 text-center border border-[var(--dark-green)] bg-[var(--background-offset)]">
                      <span className="text-[var(--dark-green)] font-medium">
                        te
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                      7
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                      8
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                      7
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                      8
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      1
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                      2
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                      3
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                      4
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                      5
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                      6
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                      7
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                      8
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--dark-purple)] text-white">
                      9
                    </td>
                    <td className="p-1 text-center font-bold bg-[var(--dark-green)] text-white">
                      10
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 mb-2">
              <p className="text-[var(--primary)] mb-2 font-medium">
                Another example:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-[var(--background)]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="p-2 text-center" colSpan={26}>
                        Complete line (26 syllables)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ĵā̃
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          hā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          ra
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          pra
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          sā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          de
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--orange)] font-medium">
                          bhā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--blue)] font-medium">
                          i
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          e
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          bha
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          va
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          ta
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          ri
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          yā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--orange)] font-medium">
                          ĵā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--blue)] font-medium">
                          i
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          kṛṣ
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--primary)] bg-[var(--background-offset)]">
                        <span className="text-[var(--primary)] font-medium">
                          ṇa
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--royal-blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--royal-blue)] font-medium">
                          -prā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--red)] bg-[var(--background-offset)]">
                        <span className="text-[var(--red)] font-medium">
                          pti
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--green)] font-medium">
                          ha
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--purple)] font-medium">
                          ya
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--orange)] bg-[var(--background-offset)]">
                        <span className="text-[var(--orange)] font-medium">
                          ĵā̃
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--blue)] bg-[var(--background-offset)]">
                        <span className="text-[var(--blue)] font-medium">
                          hā
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--dark-purple)] bg-[var(--background-offset)]">
                        <span className="text-[var(--dark-purple)] font-medium">
                          ha'
                        </span>
                      </td>
                      <td className="p-2 text-center border border-[var(--dark-green)] bg-[var(--background-offset)]">
                        <span className="text-[var(--dark-green)] font-medium">
                          te
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        1
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        2
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        3
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        4
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        5
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        6
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                        7
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                        8
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        9
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        10
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        11
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        12
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        13
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        14
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                        15
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                        16
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        17
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--primary)] text-white">
                        18
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--royal-blue)] text-white">
                        19
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--red)] text-white">
                        20
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--green)] text-white">
                        21
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--purple)] text-white">
                        22
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--orange)] text-white">
                        23
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--blue)] text-white">
                        24
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--dark-purple)] text-white">
                        25
                      </td>
                      <td className="p-1 text-center font-bold bg-[var(--dark-green)] text-white">
                        26
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={8}
                      >
                        First division (8 syllables)
                      </td>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={8}
                      >
                        Second division (8 syllables)
                      </td>
                      <td
                        className="p-1 text-center font-semibold border-t border-[var(--border)]"
                        colSpan={10}
                      >
                        Third division (10 syllables)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-[var(--primary)] mb-1">
                Songs in this meter:
              </h4>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
                <li>Anādi Karama-phale</li>
                <li>Aparādha-phale Mama</li>
                <li>Āre Bhāi! Bhajô Mora Gaurāṅga-caraṇa</li>
                <li>Bhāi-re! Eka-Dina Nīlācale</li>
                <li>Bhāi-re! Eka-Dina Śāntipure</li>
                <li>Bhāi-re! Rāma-Kṛṣṇa Gocāraṇe</li>
                <li>Bhāi-re! Śacīra Aṅgane Kabhu</li>
                <li>Bhāi-re! Śarīra Avidyā-jāl</li>
                <li>Bhāi-re! Śrī-Caitanya Nityānanda</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Dhana Mora Nityānanda</li>
                <li>Gaurāṅgera Du'ṭī Pada</li>
                <li>Hari Hari! Biphale Janama Gõāinu</li>
                <li>Hari Hari! Kṛpā Kôri' Rākhô Nija Pade</li>
                <li>Janama Saphala Tā'ra</li>
                <li>Jaya Jaya Harināma</li>
                <li>Kabe Kṛṣṇa-dhana Pābô</li>
                <li>Kali Kukura</li>
                <li>Kṛṣṇa Hôite Catur-mukha</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc list-inside text-sm text-[var(--neutral)] mt-6">
                <li>Nitāi-pada-kamala</li>
                <li>Rādhikā Caraṇa-reṇu</li>
                <li>Rādhikā-caraṇa-padma</li>
                <li>Saptadvīpa Dīpta Kôri'</li>
                <li>Śrī Guru-caraṇa-padma</li>
                <li>Śrī Rūpa Mañjarī-pada</li>
                <li>Śunô, He Rasika Jana</li>
                <li>Ṭhākura Vaiṣṇava-gaṇa</li>
                <li>Ṭhākura Vaiṣṇava-pada</li>
                <li>Yaśomatī-nandana</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--primary)] mb-4">
          Sanskrit Verse Meter
        </h2>
        <p className="mb-4 text-[var(--neutral)]">
          Meters of verses having the same number of syllables are
          differentiated by the classification of two types of syllable: long
          (guru) and short (laghu). These are represented by these symbols:
        </p>

        <div className="p-4 mb-6 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
          <div className="flex items-center mb-2">
            <span className="w-6 h-6 inline-flex items-center justify-center mr-2 border border-[var(--tertiary)] rounded-full text-xs text-[var(--tertiary)]">
              ᴗ
            </span>
            <span className="text-[var(--neutral)]">= short syllables</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="w-6 h-6 inline-flex items-center justify-center mr-2 border border-[var(--tertiary)] rounded-full text-xs text-[var(--tertiary)]">
              —
            </span>
            <span className="text-[var(--neutral)]">= long syllables</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 inline-flex items-center justify-center mr-2 border border-[var(--tertiary)] rounded-full text-xs text-[var(--tertiary)]">
              ᴏ
            </span>
            <span className="text-[var(--neutral)]">
              = when either a short or a long syllable may take place in a
              particular meter
            </span>
          </div>
        </div>

        {/* Verses with lines of 8 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 8 syllables
          </h3>
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Anuṣṭubh:</span>
            </div>
            <div className="mb-1">
              <span className="text-[var(--neutral)]">
                1st and 3rd lines: ᴏ ᴏ ᴏ ᴏ ᴗ — — —
              </span>
            </div>
            <div>
              <span className="text-[var(--neutral)]">
                2nd and 4th lines: ᴏ ᴏ ᴏ ᴏ ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Jagannāthāṣṭakam (9th verse)</li>
              <li>Śrī Keśavācāryāṣṭakam</li>
              <li>Śrī Śikṣāṣṭakam (3rd and 7th verses)</li>
              <li>Śrī Śrī Rādhā-vinoda-bihāri-tattvāṣṭakam</li>
              <li>Śrī Upadeśāmṛta (2nd, 3rd, and 4th verses)</li>
              <li>Most Bhagavad-gītā verses</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of both 10 and 11 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of both 10 and 11 syllables
          </h3>
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Sundarī:</span>
            </div>
            <div className="mb-1">
              <span className="text-[var(--neutral)]">
                1st and 3rd lines: ᴗ ᴗ — ᴗ ᴗ — ᴗ — ᴗ —
              </span>
            </div>
            <div>
              <span className="text-[var(--neutral)]">
                2nd and 4th lines: ᴗ ᴗ — — ᴗ ᴗ — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Śikṣāṣṭakam (4th, 5th, and 6th verses)</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 11 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 11 syllables
          </h3>

          {/* Upajāti */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Upajāti:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴏ — ᴗ — — / ᴗ ᴗ — ᴗ — —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Govardhanāṣṭakam</li>
              <li>Śrī Gurvaṣṭakam</li>
              <li>Śrī Kṛṣṇa-nāmāṣṭakam (4th verse)</li>
              <li>Śrī Navadvīpāṣṭakam</li>
              <li>Śrī Vṛndā-devyāṣṭakam</li>
              <li>Śrī Vṛndāvanāṣṭakam</li>
              <li>The larger verses appearing in Bhagavad-gītā</li>
            </ul>
          </div>

          {/* Svāgatā */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Svāgatā:</span>{" "}
              <span className="text-[var(--neutral)]">
                — ᴗ — / ᴗ ᴗ ᴗ — ᴗ ᴗ — —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Kuñja-bihāryāṣṭakam</li>
            </ul>
          </div>

          {/* Rathoddhatā */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Rathoddhatā:</span>{" "}
              <span className="text-[var(--neutral)]">
                — ᴗ — / ᴗ ᴗ ᴗ — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Kṛṣṇa-nāmāṣṭakam (7th verse)</li>
              <li>Śrī Rādhā Prārthanā (2nd, 3rd, and 4th verses)</li>
            </ul>
          </div>

          {/* Rājahaṁsī */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Rājahaṁsī:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ ᴗ ᴗ — ᴗ — / — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Gopī-gīta</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 12 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 12 syllables
          </h3>

          {/* Indravaṁśā */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Indravaṁśā:</span>{" "}
              <span className="text-[var(--neutral)]">
                — — ᴗ — — ᴗ ᴗ — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Śikṣāṣṭakam (8th verse)</li>
            </ul>
          </div>

          {/* Bhujaṅga-prayātaṁ */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Bhujaṅga-prayātaṁ:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ — — ᴗ — — ᴗ — — ᴗ — —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Dāmodarāṣṭakam</li>
            </ul>
          </div>

          {/* Toṭaka */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Toṭaka:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ ᴗ — ᴗ ᴗ — ᴗ ᴗ — ᴗ ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Godruma-candra-bhajanopadeśaḥ</li>
              <li>Śrī Madhurāṣṭakam</li>
              <li>Śrī Prabhupāda-padma-stavakaḥ</li>
              <li>Śrī Vrajarāja-sutāṣṭakam</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 14 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 14 syllables
          </h3>

          {/* Vasanta-tilakā */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Vasanta-tilakā:</span>{" "}
              <span className="text-[var(--neutral)]">
                — — ᴗ — ᴗ ᴗ ᴗ — / ᴗ ᴗ — ᴗ — —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Brahmā-saṁhita (Verses 29–55)</li>
              <li>Śrī Gāndharvā-Samprārthanāṣṭakam</li>
              <li>Śrī Lalitāṣṭakam</li>
              <li>Śrī Śikṣāṣṭakam (2nd verse)</li>
              <li>Śrī Upadeśāmṛta (5th, 6th, 7th, and 8th verses)</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 15 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 15 syllables
          </h3>

          {/* Mālinī */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Mālinī:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ ᴗ ᴗ ᴗ ᴗ ᴗ — — / — ᴗ — — ᴗ — —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Govardhana-vāsa-prārthanā-daśakam</li>
              <li>Śrī Kṛṣṇa-nāmāṣṭakam (5th verse)</li>
              <li>Śrī Rādhā-kuṇḍāṣṭakam</li>
              <li>Śrī Rādhā-prārthanā (1st verse)</li>
              <li>Śrī Śyāma-kuṇḍāṣṭakam</li>
            </ul>
          </div>

          {/* Tūṇaka */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Tūṇaka:</span>{" "}
              <span className="text-[var(--neutral)]">
                — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Kṛṣṇa-candrāṣṭakam</li>
              <li>Śrī Rādhikāṣṭakam</li>
              <li>Śrī Yamunāṣṭakam</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 16 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 16 syllables
          </h3>

          {/* Pañca-cāmara */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Pañca-cāmara:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Nanda-nandanāṣṭakam</li>
              <li>Śrī Rādhā-kṛpā-kaṭākṣa-stotram</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 17 syllables */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 17 syllables
          </h3>

          {/* Mandākrāntā */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Mandākrāntā:</span>{" "}
              <span className="text-[var(--neutral)]">
                — — — — / ᴗ ᴗ ᴗ ᴗ ᴗ — / — ᴗ — — ᴗ — —
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Upadeśāmṛta (11th verse)</li>
            </ul>
          </div>

          {/* Śikhariṇī */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Śikhariṇī:</span>{" "}
              <span className="text-[var(--neutral)]">
                ᴗ — — — — — / ᴗ ᴗ ᴗ ᴗ ᴗ — — ᴗ ᴗ ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>
                Śrī Brahmā-saṁhita (Verse 56 [renumbered in this book as Verse
                28])
              </li>
              <li>Śrī Jagannāthāṣṭakam</li>
              <li>Śrī Kṛṣṇa-nāmāṣṭakam (3rd verse)</li>
              <li>Śrī Manaḥ-śikṣā</li>
              <li>Śrī Nityānandāṣṭakam</li>
            </ul>
          </div>
        </div>

        {/* Verses with lines of 19 syllables */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--highlight)] mb-2">
            Verses with lines of 19 syllables
          </h3>

          {/* Śārdūla-vikrīḍita */}
          <div className="p-4 mb-2 border rounded-md border-[var(--border)] bg-[var(--background-offset)]">
            <div className="mb-2">
              <span className="font-medium">Śārdūla-vikrīḍita:</span>{" "}
              <span className="text-[var(--neutral)]">
                — — — ᴗ ᴗ — ᴗ — ᴗ ᴗ ᴗ— / — — ᴗ — — ᴗ —
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[var(--primary)] mb-1">
              Songs in this meter:
            </h4>
            <ul className="list-disc list-inside text-sm text-[var(--neutral)]">
              <li>Śrī Daśāvatāra-stotram (12th verse)</li>
              <li>Śrī Kṛṣṇa-nāmāṣṭakam (6th verse)</li>
              <li>Śrī Ṣaḍ-gosvāmyaṣṭakam</li>
              <li>Śrī Śikṣāṣṭakam (1st verse)</li>
              <li>Śrī Upadeśāmṛta (9th and 10th verses)</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="p-4 text-center text-[var(--tertiary)] border-t border-[var(--border)]">
        <p>
          For more on Bengali and Sanskrit meters, please visit:{" "}
          <a
            href="https://www.gaudiyakirtan.com/meters"
            className="text-[var(--primary)] hover:underline"
          >
            www.gaudiyakirtan.com/meters
          </a>
        </p>
      </div>
    </div>
  );
}

export default VerseMetersPage