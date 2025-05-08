
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-primary-500 text-2xl font-bold">AgendPet</Link>
            <p className="mt-2 text-sm text-gray-500">
              A solução completa de agendamento online para petshops e clínicas veterinárias.
              Simplifique sua gestão e ofereça uma experiência moderna para seus clientes.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Recursos</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/recursos" className="text-sm text-gray-500 hover:text-primary-500">
                  Agendamento Online
                </Link>
              </li>
              <li>
                <Link to="/recursos" className="text-sm text-gray-500 hover:text-primary-500">
                  Gestão de Serviços
                </Link>
              </li>
              <li>
                <Link to="/recursos" className="text-sm text-gray-500 hover:text-primary-500">
                  Notificações
                </Link>
              </li>
              <li>
                <Link to="/recursos" className="text-sm text-gray-500 hover:text-primary-500">
                  Relatórios
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Empresa</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/sobre" className="text-sm text-gray-500 hover:text-primary-500">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/precos" className="text-sm text-gray-500 hover:text-primary-500">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-gray-500 hover:text-primary-500">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-sm text-gray-500 hover:text-primary-500">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            &copy; {currentYear} AgendPet. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
