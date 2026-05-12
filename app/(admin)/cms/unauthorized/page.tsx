export default function Unauthorized() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[70vh]'>
      <h1 className='text-6xl mb-4'>🛑</h1>
      <h2 className='text-2xl font-bold text-gray-800'>Akses Ditolak</h2>
      <p className='text-gray-500 mt-2'>
        Anda tidak memiliki izin untuk melihat halaman ini.
      </p>
    </div>
  );
}
