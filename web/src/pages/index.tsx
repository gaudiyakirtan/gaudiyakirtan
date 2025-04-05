import React from 'react'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { HomeScreen } from '../components/HomeScreen'
import Head from 'next/head'

const Home: React.FC = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Gaudiya Kirtan - Collection of Vaishnava Songs</title>
        <meta name="description" content="A collection of Gaudiya Vaishnava bhajans, kirtans, and prayers in various languages." />
      </Head>
      
      <HomeScreen />
    </>
  )
}

export default Home