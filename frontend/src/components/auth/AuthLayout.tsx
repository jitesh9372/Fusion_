import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthBackground from '@/components/auth/AuthBackground';
import AuthBranding from '@/components/auth/AuthBranding';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/common/Logo';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * AuthLayout
 *
 * Desktop: Two-column split — branding left, persistent stable auth card right
 * Tablet:  Reduced branding area
 * Mobile:  Single-column — compact logo top, persistent auth card below
 */
const AuthLayout: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { smoothX, smoothY, containerRef } = useMouseParallax(!reducedMotion);

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden">
      <AuthBackground />

      {/* Desktop: full two-column layout */}
      <div className="relative z-10 flex w-full">

        {/* ── Left branding panel (hidden on mobile) ── */}
        <div
          ref={containerRef}
          className="hidden lg:flex flex-col w-1/2 xl:w-[55%] min-h-screen relative"
        >
          <AuthBranding smoothX={smoothX} smoothY={smoothY} />
        </div>

        {/* ── Right auth card panel ── */}
        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 xl:w-[45%] min-h-screen px-4 sm:px-8 py-8 sm:py-12">

          {/* Mobile-only compact logo */}
          <div className="lg:hidden mb-6">
            <Logo size="md" variant="light" animated showTagline />
          </div>

          {/* Stable, perfectly centered Auth Card container */}
          <div className="w-full max-w-[460px]">
            <AuthCard>
              <Outlet />
            </AuthCard>
          </div>

          {/* Mobile footer */}
          <p className="lg:hidden mt-6 text-xs text-white/25 text-center">
            © {new Date().getFullYear()} FUSION. Skills. Services. Stronger Communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
