import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Flip on the production (campussheba.com) deployment only: NEXT_PUBLIC_COMING_SOON=true
// Local dev & preview deployments leave it unset, so the full app stays visible.
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

function middleware(request: NextRequest) {
    if (COMING_SOON) {
        const { pathname } = request.nextUrl;
        // Let coming-soon and legal pages render; rewrite everything else to coming-soon.
        if (!/\/(coming-soon|privacy-policy|terms|account-deletion)\/?$/.test(pathname)) {
            const locale =
                routing.locales.find(
                    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
                ) ?? routing.defaultLocale;
            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/coming-soon`;
            return NextResponse.rewrite(url);
        }
    }
    return intlMiddleware(request);
}

export const proxy = middleware;
export default middleware;

export const config = {
    matcher: ['/((?!api|health|_next|.*\\..*).*)'],
};
