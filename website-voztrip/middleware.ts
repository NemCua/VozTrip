import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
// Static import — bundled at build time, safe for Edge runtime
import featuresJson from "../config/features.json";
import type { FeaturesConfig } from "./types/features";

const features = featuresJson as FeaturesConfig;

// Returns { enabled, message? } for the given pathname.
// Checked top-to-bottom; first match wins.
function checkFeatureFlag(pathname: string): { enabled: boolean; message?: string } {
  // 1. Global maintenance mode — blocks everything
  if (features.app.maintenance.enabled) {
    return { enabled: false, message: features.app.maintenance.message };
  }

  const f = features.features;

  // 2. Auth pages
  if (pathname.startsWith("/login"))    return { enabled: features.auth.login.enabled };
  if (pathname.startsWith("/register")) return { enabled: features.auth.register.enabled };

  // 3. Static pages
  if (pathname.startsWith("/privacy")) return { enabled: features.pages.privacy.enabled };

  // 4. Admin sub-pages
  if (pathname.startsWith("/admin/dashboard"))  return { enabled: f.admin.dashboard.enabled };
  if (pathname.startsWith("/admin/sellers"))    return { enabled: f.admin.sellerManagement.enabled };
  if (pathname.startsWith("/admin/users"))      return { enabled: f.admin.userManagement.enabled };
  if (pathname.startsWith("/admin/pois"))       return { enabled: f.admin.poiModeration.enabled };
  if (pathname.startsWith("/admin/media"))      return { enabled: f.admin.mediaModeration.enabled };
  if (pathname.startsWith("/admin/zones"))      return { enabled: f.admin.zoneManagement.enabled };
  if (pathname.startsWith("/admin/languages"))  return { enabled: f.admin.languageManagement.enabled };

  // 5. Seller sub-pages
  if (pathname.startsWith("/seller/dashboard")) return { enabled: f.seller.dashboard.enabled };
  if (pathname.startsWith("/seller/pois"))      return { enabled: f.seller.poiManagement.enabled };
  if (pathname.startsWith("/seller/upgrade"))   return { enabled: f.seller.vipUpgrade.enabled };

  return { enabled: true };
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Feature flag gate — redirect to /maintenance when disabled
    const check = checkFeatureFlag(pathname);
    if (!check.enabled) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      url.searchParams.delete("callbackUrl");
      if (check.message) url.searchParams.set("msg", check.message);
      return NextResponse.redirect(url);
    }

    // Role-based auth guard (only for authenticated routes)
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/seller", req.url));
    }
    if (pathname.startsWith("/seller") && token?.role !== "seller") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  },
  {
    callbacks: {
      // Public routes (login, register, privacy) do not require a token
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/privacy")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/login",
    "/register",
    "/privacy",
    "/seller/:path*",
    "/admin/:path*",
  ],
};
