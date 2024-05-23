export default function Page() {
  return (
    <div className="mt-40 px-4">
      <div className="relative w-32 h-32 rounded-full bg-red-500 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-white transform origin-left rotate-4"></div>
      </div>

      <div className="relative w-32 h-32 bg-gray-300 transform rotate-45">
        <div className="absolute inset-0 w-16 h-16 bg-gray-100 transform -rotate-45 top-1/6 left-1/4"></div>
      </div>

      <div className="relative flex items-center">
        <div className="w-0 h-0 border-t-[50px] border-t-transparent border-b-[50px] border-b-transparent border-r-[100px] border-r-green-800"></div>
        <div className="w-[8px] h-[100px] bg-red-500 absolute left-[100px]"></div>
      </div>
    </div>
  );
}
