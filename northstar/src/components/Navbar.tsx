import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-gray-900">
              Northstar Digital
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</Link>
            <Link href="/services" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Services</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</Link>
            <Link href="/contact" className="bg-black text-white px-4 py-2 text-sm font-medium">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
