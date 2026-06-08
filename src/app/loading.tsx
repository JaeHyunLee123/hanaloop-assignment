// 대시보드 및 페이지의 로딩 상태 시 화면 중앙에 나타나는 큼직한 로딩 스피너 컴포넌트
export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-border opacity-20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-400 text-sm animate-pulse">Loading analytics data...</p>
    </div>
  );
}
