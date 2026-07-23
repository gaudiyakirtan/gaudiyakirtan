// Legacy short URLs carried over from the holding site (gaudiya-kirtan/coming-soon), which
// currently serves gaudiyakirtan.com. They must keep working when this app takes that domain over,
// or every link already shared into the community 404s.
//
// All forward to vineofdevotion.com path-for-path, as permanent (308) redirects — same as the
// holding site does today. Ported verbatim; see the ⚠ note below before "fixing" any of them.
const VINE_OF_DEVOTION = 'https://www.vineofdevotion.com'

const LEGACY_SHORT_PATHS = [
    // Song collections
    'bvtsongs', 'kalyana-kalpataru', 'upadesamrta',
    'panca-gita', 'panca-tattva', 'prayersofsurrender',
    // Liturgical
    'sandhya-arati', 'asta-yama', 'adhivasa-kirtana', 'vaisnava-vandana', 'socakas',
    // Festival & dhāma
    'festival', 'govardhana', 'syama-kunda',
    // Learning aids
    // ⚠ These four duplicate content this app already ships (/resources/pronunciation,
    //   /resources/diacritics, /resources/meters). They are kept pointing OUTWARD so behaviour
    //   matches the holding site exactly. If this app takes the domain, consider repointing them
    //   at the internal routes instead — sending a reader off-site to content we already have is
    //   worse than keeping them here. Deliberate decision, not an oversight.
    'pronunciation', 'transliteration', 'melody', 'raga', 'sanskrit-meter', 'bengali-meter',
    // Book apparatus
    'preface', 'page-numbers',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return LEGACY_SHORT_PATHS.map((path) => ({
            source: `/${path}`,
            destination: `${VINE_OF_DEVOTION}/${path}`,
            permanent: true,
        }))
    },
    reactStrictMode: false,
    transpilePackages: [
    ],
    // ESLint runs during `next build` and blocks on errors (the prior `ignoreDuringBuilds: true`
    // is gone): the backlog it was hiding is cleared, and the noisy react/no-unescaped-entities rule
    // is turned off in eslint.config.mjs, so lint is now a real gate on both Vercel and CI.
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig;