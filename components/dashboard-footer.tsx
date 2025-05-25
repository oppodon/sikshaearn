import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="w-full border-t bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <span className="font-semibold text-lg">Siksha Earn</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Empowering learners with quality education and skills for a better future.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Course Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Free Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/mission"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                >
                  FAQs
                </Link>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+977 9812345678</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@sikshaearn.np</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 Siksha Earn Nepal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
