import Link from "next/link"

export function Footer() {

  return (
    <footer className="w-full py-2 px-4 text-center bg-[#333333]">
      <p className="text-xs text-gray-400">
        powered by{" "}
        <Link 
          href="https://www.piggybanks.xyz/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-all duration-200 hover:font-bold"
          style={{ color: '#EC9AA6' }}
        >
          piggybanks.xyz
        </Link>
        {" "}🐷
      </p>
    </footer>
  )
} 