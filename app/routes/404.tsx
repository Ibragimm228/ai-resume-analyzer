import { Link } from "react-router";
import type { Route } from "./+types/404";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <button 
              onClick={() => window.history.back()} 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  if (url.pathname.includes('.well-known') || url.pathname.includes('devtools')) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  throw new Response("Not Found", { status: 404 });
}
