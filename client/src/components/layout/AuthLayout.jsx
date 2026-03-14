import { Box } from 'lucide-react';

/**
 * Split-screen auth layout: left = branding + background, right = white form.
 * variant: 'default' (grey/desaturated) | 'blue' (blue-tinted)
 */
export default function AuthLayout({ variant = 'default', children }) {
  const isBlue = variant === 'blue';
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding + background */}
      <div
        className={`hidden lg:flex lg:w-[55%] flex-col justify-end p-10 bg-cover bg-center ${
          isBlue
            ? 'bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-slate-900/95'
            : 'bg-gradient-to-br from-slate-700/90 via-slate-800/85 to-slate-900/95'
        }`}
        style={{
          backgroundImage: isBlue
            ? 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80)'
            : 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Box className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CoreInventory</span>
        </div>
        <h2 className="text-3xl font-bold text-white leading-tight mb-3">
          {isBlue ? 'Master your supply chain.' : 'Advanced Logistics for the '}
          {!isBlue && <span className="text-blue-400">Modern Enterprise.</span>}
        </h2>
        <p className="text-white/80 text-base max-w-md">
          {isBlue
            ? 'Streamline operations, optimize stock levels, and gain real-time visibility across your entire enterprise.'
            : 'Real-time tracking, intelligent forecasting, and seamless supply chain integration at your fingertips.'}
        </p>
      </div>

      {/* Right panel — white form */}
      <div className="flex-1 flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 animate-fade-in-up">
        {children}
      </div>
    </div>
  );
}
