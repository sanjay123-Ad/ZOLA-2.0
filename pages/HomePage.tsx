import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { VirtualPhotoshootIcon, AssetGeneratorIcon, ProductForgeIcon, StyleSceneIcon, ArrowRightIcon } from '../components/icons';
import { PATHS } from '../constants/paths';

interface HomePageProps {
  user: User;
}

const FeatureCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  tourId: string;
}> = ({ icon, title, subtitle, description, onClick, tourId }) => (
  <div 
    onClick={onClick}
    data-tour-id={tourId}
    className="group relative flex flex-col bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[2rem] p-8 transition-all duration-500 cursor-pointer border-[3px] border-white dark:border-gray-700 shadow-xl hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] hover:-translate-y-2 overflow-hidden h-full"
  >
    {/* Decorative Background Elements - Sky Blue Glow */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-sky-400/20 group-hover:scale-110" />
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10 opacity-0 group-hover:opacity-100 transition-all duration-700" />
    
    <div className="relative z-10 flex flex-col h-full">
      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-sky-600 dark:text-sky-400 border border-white/60 dark:border-gray-600/60 group-hover:scale-110 group-hover:bg-sky-500 dark:group-hover:bg-sky-600 group-hover:text-white transition-all duration-500 ease-out">
        {icon}
      </div>

      <div className="mb-4">
        {subtitle && (
          <span className="inline-block py-1 px-2.5 rounded-lg bg-white/50 dark:bg-gray-700/50 text-[10px] font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-3 border border-sky-100/50 dark:border-sky-800/50 shadow-sm group-hover:bg-sky-500 dark:group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-500 dark:group-hover:border-sky-600 transition-colors duration-300">
            {subtitle}
          </span>
        )}
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300 tracking-tight">
        {title}
      </h3>
      </div>

      <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-8 font-bold group-hover:text-slate-800 dark:group-hover:text-gray-200 transition-colors">
        {description}
      </p>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-gray-700 group-hover:border-sky-100 dark:group-hover:border-sky-800 transition-colors">
        <div className="flex items-center text-slate-900 dark:text-white font-extrabold text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          Get Started
          <div className="ml-2 w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-slate-100 dark:border-gray-600 flex items-center justify-center group-hover:bg-sky-500 dark:group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-500 dark:group-hover:border-sky-600 transition-all duration-300 group-hover:translate-x-2">
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();
  return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <main>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-100">
                    New Gemini 3 Models Available
                  </span>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                  Creative Studio
                </h2>
                <p className="text-lg text-slate-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                  Disrupting e-commerce product photography with automated visual asset creation. 
                  Select a tool below to start generating 4K assets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <FeatureCard
                tourId="virtual-photoshoot"
                icon={<VirtualPhotoshootIcon />}
                title="Virtual Photoshoot"
                subtitle="SEAMLESS SWAP"
                description="Swap any product onto your model with 100% facial preservation and cinematic realism."
                onClick={() => navigate(PATHS.VIRTUAL_PHOTOSHOOT)}
              />
               <FeatureCard
                tourId="style-scene"
                icon={<StyleSceneIcon />}
                title="Style|Scene Campaigner"
                subtitle="AI LIFESTYLE DIRECTOR"
                description="Generate an entire lifestyle campaign. Choose a model and a scene instantly."
                onClick={() => navigate(PATHS.STYLE_SCENE)}
              />
              <FeatureCard
                tourId="asset-generator"
                icon={<AssetGeneratorIcon />}
                title="E-commerce Asset Gen"
                subtitle="CORE EXTRACTION"
                description="Turn lifestyle shots into ghost mannequin assets, including apparel and accessories."
                onClick={() => navigate(PATHS.ASSET_GENERATOR)}
              />
              <FeatureCard
                tourId="catalog-forged"
                icon={<ProductForgeIcon />}
                title="Perfect Product Forge"
                subtitle="CATALOG | FORGED"
                description="Eliminate wrinkles, correct shape, and generate 4K hyper-realistic studio shots."
                onClick={() => navigate(PATHS.CATALOG_FORGED)}
              />
            </div>
          </main>
          
          <footer className="text-center mt-16 text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Zola AI Fashion Studio. All rights reserved.</p>
            <button 
              onClick={() => navigate(PATHS.ABOUT)}
              className="mt-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold transition-colors"
            >
              About Zola AI Fashion Studio
            </button>
          </footer>
        </div>
      </div>
  );
};

export default HomePage;
