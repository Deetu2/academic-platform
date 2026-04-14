// Reusable skeleton loading components

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-40" />
        </div>
      </div>
    </td>
    <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
    <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-16" /></td>
    <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
  </tr>
);

export const CourseSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-24 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-4 mt-4">
        <div className="h-8 bg-gray-200 rounded flex-1" />
        <div className="h-8 bg-gray-200 rounded flex-1" />
        <div className="h-8 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-20 h-20 bg-gray-200 rounded-full" />
      <div>
        <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-56" />
      </div>
    </div>
    <div className="space-y-4">
      {[1,2,3,4].map(i => (
        <div key={i}>
          <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  </div>
);
