import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/habits(.*)',
  '/calendar(.*)',
  '/stats(.*)',
  '/todos(.*)',
  '/timer(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  console.log('Middleware triggered for URL:', req.url);
  const authState = await auth();
  console.log('Auth state:', { userId: authState.userId, orgId: authState.orgId, sessionId: authState.sessionId });

  if (isProtectedRoute(req)) {
    console.log('Protected route, calling auth.protect()');
    auth.protect();
    console.log('After auth.protect()');
  }

  // Add a log to see if a redirect is happening and to where
  // This requires inspecting the response, which clerkMiddleware handles internally.
  // For now, we'll log before and after protect() and rely on browser dev tools for redirect tracing.
}, {
  // Add authorizedParties for enhanced security in production
  // This prevents subdomain cookie leaking attacks
  authorizedParties: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXT_PUBLIC_APP_URL || 'https://growmoji.app']
    : undefined,
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 