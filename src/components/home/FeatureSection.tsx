
import { Calendar, Edit, Save } from "lucide-react";

const features = [
  {
    name: 'Agendamento online 24/7',
    description:
      'Permita que seus clientes agendem serviços a qualquer hora, diretamente pelo smartphone ou computador.',
    icon: Calendar,
  },
  {
    name: 'Personalização completa',
    description:
      'Personalize serviços, horários disponíveis e preços de acordo com as necessidades do seu petshop.',
    icon: Edit,
  },
  {
    name: 'Controle total dos agendamentos',
    description:
      'Visualize todos os agendamentos em um só lugar e gerencie seu dia a dia com eficiência.',
    icon: Save,
  },
];

const FeatureSection = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Recursos</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A melhor maneira de gerenciar seu petshop
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            O AgendPet foi desenvolvido para facilitar o dia a dia do seu petshop e melhorar a experiência dos seus clientes.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="relative card-hover rounded-lg bg-white p-6 border border-gray-100">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
