import Image from 'next/image'
import { Search } from './search'

export default function Home() {
  return (
    <main className="w-full min-w-0 flex-auto">
      <Search></Search>
    </main>
  )
}
