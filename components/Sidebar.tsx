import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { User } from '../types';
import { 
    VirtualPhotoshootIcon, AssetGeneratorIcon, ProductForgeIcon, StyleSceneIcon,
    GalleryIcon, PricingIcon, SettingsIcon, ProfileIcon, HelpIcon, LogoutIcon
} from './icons';
import { PATHS } from '../constants/paths';

interface SidebarProps {
    user: User;
    onLogout: (e?: React.MouseEvent) => void;
    onHelpClick: () => void;
    isCollapsed: boolean;
    closeMobileSidebar: () => void;
}

const NavItem: React.FC<{
    to: string;
    icon: React.ReactElement;
    label: string;
    isCollapsed: boolean;
    onClick?: () => void;
}> = ({ to, icon, label, isCollapsed, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            title={label}
            className={({ isActive }) => `relative group w-full flex items-center py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-sky-50 text-sky-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : 'px-4'}`}
        >
            <div className={`w-6 h-6 ${!isCollapsed ? 'mr-4' : ''}`}>{icon}</div>
            {!isCollapsed && <span className="truncate">{label}</span>}
            {isCollapsed && (
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    {label}
                                </div>
            )}
        </NavLink>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onHelpClick, isCollapsed, closeMobileSidebar }) => {
    const coreFeatures = [
        { path: PATHS.VIRTUAL_PHOTOSHOOT, icon: <VirtualPhotoshootIcon />, label: 'Virtual Photoshoot' },
        { path: PATHS.STYLE_SCENE, icon: <StyleSceneIcon />, label: 'StyleScene' },
        { path: PATHS.ASSET_GENERATOR, icon: <AssetGeneratorIcon />, label: 'Asset Generator' },
        { path: PATHS.CATALOG_FORGED, icon: <ProductForgeIcon />, label: 'Catalog Forged' },
    ];
    
    const utilityNav = [
        { path: PATHS.GALLERY, icon: <GalleryIcon />, label: 'My Gallery' },
        { path: PATHS.ASSET_COLLECTION, icon: <AssetGeneratorIcon />, label: 'Asset Collection' },
        { path: PATHS.PRICING, icon: <PricingIcon />, label: 'Pricing & Usage' },
        { path: PATHS.PROFILE, icon: <ProfileIcon />, label: 'Profile' },
        { path: PATHS.SETTINGS, icon: <SettingsIcon />, label: 'Settings' },
    ];

    const handleHelpClick = () => {
        onHelpClick();
        closeMobileSidebar();
    };

    return (
        <aside className={`flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-4 h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <Link 
              to={PATHS.HOME}
              onClick={closeMobileSidebar}
              className={`mb-8 px-2 h-auto flex items-start cursor-pointer gap-3 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : ''}`} 
            >
                <div className="w-11 h-11 bg-sky-500 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/20 relative overflow-hidden group flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img src="https://i.postimg.cc/BQ63Y0dw/Frame-13.png" alt="Zola AI Fashion Studio" className="relative z-10 h-6 w-6 object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-black text-2xl text-slate-900 tracking-tight leading-none">ZOLA AI</span>
                        <span className="text-[10px] font-extrabold text-sky-600 tracking-[0.25em] uppercase mt-1">Fashion Studio</span>
                    </div>
                )}
            </Link>
            
            <nav className="flex-grow space-y-1">
                {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WORKSPACE</p>}
                {coreFeatures.map(item => (
                    <NavItem key={item.path} to={item.path} isCollapsed={isCollapsed} onClick={closeMobileSidebar} {...item} />
                ))}

                <div className={`${isCollapsed ? 'mt-4' : 'pt-6'}`}>
                    {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOOLS</p>}
                    {utilityNav.map(item => (
                       <NavItem key={item.path} to={item.path} isCollapsed={isCollapsed} onClick={closeMobileSidebar} {...item} />
                    ))}
                    <button
                        onClick={handleHelpClick}
                        title="Help / Tour"
                        className={`relative group w-full flex items-center py-3 text-sm font-semibold rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${isCollapsed ? 'justify-center' : 'px-4'}`}
                    >
                        <div className={`w-6 h-6 ${!isCollapsed ? 'mr-4' : ''}`}><HelpIcon /></div>
                        {!isCollapsed && <span className="truncate">Help / Tour</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                Help / Tour
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            <div className="mt-auto">
                <div className="p-2 border-t border-gray-200">
                    <div className={`flex items-center ${isCollapsed ? 'flex-col' : ''}`}>
                        <div className="relative group">
                            {user.avatar && (
                                <img 
                                    src={user.avatar} 
                                    alt="User avatar" 
                                    className="w-10 h-10 rounded-full" 
                                    title={isCollapsed ? user.username : undefined}
                                />
                            )}
                            {isCollapsed && user.avatar && (
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    {user.username}
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{user.username}</p>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onLogout(e);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center transition-colors mt-1"
                                    type="button"
                                >
                                    <div className="w-3 h-3 mr-1"><LogoutIcon /></div>
                                    Sign Out
                                </button>
                            </div>
                        )}
                        
                        {isCollapsed && (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onLogout(e);
                                }} 
                                title="Sign Out" 
                                className="relative group mt-3 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                type="button"
                            >
                                <div className="w-5 h-5"><LogoutIcon /></div>
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                    Sign Out
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
