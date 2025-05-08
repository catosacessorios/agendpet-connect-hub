
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: 'Grátis',
    price: '0',
    description: 'Para petshops pequenos que estão começando',
    features: [
      'Até 20 agendamentos por mês',
      'Cadastro de até 5 serviços',
      'Página de agendamento personalizada',
      'Notificações por e-mail',
    ],
    buttonText: 'Criar conta gratuita',
    buttonVariant: 'outline' as const,
    href: '/cadastro',
    mostPopular: false,
  },
  {
    name: 'Premium',
    price: '49,90',
    description: 'Para petshops que querem crescer',
    features: [
      'Agendamentos ilimitados',
      'Serviços ilimitados',
      'Página de agendamento personalizada',
      'Notificações por e-mail e SMS',
      'Relatórios detalhados',
      'Cadastro de clientes',
      'Múltiplos funcionários',
      'Suporte prioritário',
    ],
    buttonText: 'Começar agora',
    buttonVariant: 'default' as const,
    href: '/cadastro',
    mostPopular: true,
  },
];

const PricingSection = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Preços</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Planos para todos os tamanhos de petshop
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Escolha o plano que melhor se adapta às necessidades do seu negócio.
          </p>
        </div>

        <div className="mt-10 space-y-12 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`${
                tier.mostPopular
                  ? 'border-primary-500 shadow-lg scale-105'
                  : 'border-gray-200'
              } relative rounded-2xl border bg-white p-6 sm:p-10 transition-all duration-200`}
            >
              {tier.mostPopular && (
                <span className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                  Mais popular
                </span>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-gray-500">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-gray-900">R${tier.price}</span>
                  {tier.price !== '0' && <span className="text-base font-medium text-gray-500">/mês</span>}
                </div>
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
                    </div>
                    <p className="ml-3 text-base text-gray-500">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to={tier.href}>
                  <Button
                    variant={tier.buttonVariant}
                    className={`w-full py-6 text-lg ${
                      tier.mostPopular ? 'shadow-md hover:shadow-lg' : ''
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
