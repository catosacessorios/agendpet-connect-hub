
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/use-user-type';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { userType } = useUserType();
  const navigate = useNavigate();

  // Fecha o menu ao mudar de página
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-500 text-2xl font-bold">AgendPet</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
              Início
            </Link>
            <Link to="/precos" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
              Preços
            </Link>
            <Link to="/recursos" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
              Recursos
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userType === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Painel Administrativo
                    </DropdownMenuItem>
                  )}
                  {userType === "cliente" && (
                    <DropdownMenuItem onClick={() => navigate("/cliente")}>
                      Meu Painel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Entrar</Button>
                </Link>
                <Link to="/cadastro">
                  <Button size="sm">Criar conta</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
            Início
          </Link>
          <Link to="/precos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
            Preços
          </Link>
          <Link to="/recursos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">
            Recursos
          </Link>

          {user ? (
            <>
              {userType === "admin" && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50">
                  Painel Administrativo
                </Link>
              )}
              {userType === "cliente" && (
                <Link to="/cliente" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50">
                  Meu Painel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-500 hover:bg-gray-50"
              >
                Sair
              </button>
            </>
          ) : (
            <div className="mt-4 flex flex-col space-y-2 px-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button className="w-full">Criar conta</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
