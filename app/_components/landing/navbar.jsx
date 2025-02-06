'use client'

import Link from "next/link"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  return (
    <nav className="w-full bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-red-600">
          DataChat
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {[
            ["Home", "/"],
            ["Features", "/features"], 
            ["Connect DB", "/connect"],
            ["Chat", "/chat"],
            ["Visualize", "/visualize"],
            ["Docs", "/docs"],
            ["Examples", "/examples"],
            ["Pricing", "/pricing"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="text-gray-600 hover:text-gray-900 transition-colors">
              {label}
            </Link>
          ))}

          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/chats')}
                className="rounded-full bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600"
              >
                Chat
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
