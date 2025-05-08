
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CtaSection = () => {
  return (
    <div className="bg-primary-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:py-16 flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-3/5">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Pronto para modernizar</span>
            <span className="block">seu petshop?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-white opacity-90">
            Junte-se a centenas de petshops que já estão usando o AgendPet para melhorar
            a experiência dos seus clientes e simplificar a gestão dos agendamentos.
          </p>
        </div>
        <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row lg:flex-col space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-4">
          <Link to="/cadastro">
            <Button 
              size="lg" 
              className="w-full bg-white text-primary-600 hover:bg-gray-100 shadow-lg px-8"
            >
              Começar gratuitamente
            </Button>
          </Link>
          <Link to="/demonstracao">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-white text-white hover:bg-primary-500 px-8"
            >
              Agendar uma demonstração
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
