export default function ErrorMessage({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="text-5xl">😕</span>
      <p className="text-yt-text2 text-center max-w-sm">{message}</p>
    </div>
  )
}
