import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';
import GertrudeIcon from '@/assets/images/gertrude_icon_light.svg';

const Navigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navItems: any[] = [];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <>
            {/* Desktop Navigation */}
            <div className='hidden md:block bg-[#7F4F61] shadow-lg'>
                <div className='max-w-6xl mx-auto flex items-center justify-between p-4'>
                    <Link to='/' className='flex items-center space-x-2'>
                        {/* <Heart className='h-8 w-8 text-[#EFD492]' /> */}
                        <img
                            src={GertrudeIcon}
                            alt='Gertrude'
                            style={{
                                height: '45px',
                                width: '45px',
                            }}
                            className='h-8 w-8'
                        />

                        <div>
                            <h1 className='text-xl font-bold text-white'>
                                Gertrude
                            </h1>
                            <p className='text-xs text-[#AFD0CD]'>
                                Assisted Living Event Planning
                            </p>
                        </div>
                    </Link>

                    <nav className='flex space-x-1'>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={
                                            isActive(item.path)
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className={`flex items-center space-x-2 ${
                                            isActive(item.path)
                                                ? 'bg-[#C08777] text-white hover:bg-[#C08777]/90'
                                                : 'text-[#AFD0CD] hover:text-white hover:bg-[#C08777]/20'
                                        }`}
                                    >
                                        <Icon className='h-4 w-4' />
                                        <span>{item.label}</span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className='md:hidden bg-[#7F4F61] shadow-lg'>
                <div className='flex items-center justify-between p-4'>
                    <Link to='/' className='flex items-center space-x-2'>
                        <Heart className='h-6 w-6 text-[#EFD492]' />
                        <span className='text-lg font-bold text-white'>
                            Gertrude
                        </span>
                    </Link>

                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className='text-[#AFD0CD] hover:text-white hover:bg-[#C08777]/20'
                    >
                        {isMobileMenuOpen ? (
                            <X className='h-5 w-5' />
                        ) : (
                            <Menu className='h-5 w-5' />
                        )}
                    </Button>
                </div>

                {isMobileMenuOpen && (
                    <div className='border-t border-[#C08777] p-4'>
                        <nav className='space-y-2'>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        <Button
                                            variant={
                                                isActive(item.path)
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            className={`w-full justify-start ${
                                                isActive(item.path)
                                                    ? 'bg-[#C08777] text-white hover:bg-[#C08777]/90'
                                                    : 'text-[#AFD0CD] hover:text-white hover:bg-[#C08777]/20'
                                            }`}
                                        >
                                            <Icon className='h-4 w-4 mr-2' />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navigation;
