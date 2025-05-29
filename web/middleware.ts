import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/habits(.*)',
  '/calendar(.*)',
  '/stats(.*)',
  '/todos(.*)',
  '/timer(.*)',
  '/debug(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  console.log('Middleware triggered for URL:', url.pathname + url.search);
  
  const authState = await auth();
  console.log('Auth state:', { 
    userId: authState.userId, 
    orgId: authState.orgId, 
    sessionId: authState.sessionId,
    pathname: url.pathname 
  });

  if (isProtectedRoute(req)) {
    console.log('Protected route detected, calling auth.protect()');
    
    try {
      await auth.protect();
      console.log('Auth protection successful for user:', authState.userId);
    } catch (error) {
      console.error('Auth protection failed:', error);
      // This will redirect to sign-in page
      throw error;
    }
  }

  // Log successful middleware completion
  console.log('Middleware completed successfully for:', url.pathname);
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