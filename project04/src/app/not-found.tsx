'use client';

import { useParams } from 'next/navigation';

export default function NotFoundPage() {
  const params = useParams();
  
  if (params?.locale === 'zh' || params?.locale === 'en') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg text-gray-600">页面未找到</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600">Page Not Found</p>
    </div>
  );
}
