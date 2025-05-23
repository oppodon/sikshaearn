export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player Skeleton */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
              <div className="p-4 bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Info Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Content Tabs Skeleton */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200 p-0">
                <div className="flex space-x-8 px-6">
                  <div className="h-12 w-20 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-12 w-20 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-12 w-16 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-12 w-24 bg-gray-200 rounded-t animate-pulse"></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="flex justify-between">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Content List Skeleton */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Info Skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-px w-full bg-gray-200 my-4"></div>
                <div className="flex justify-between">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
