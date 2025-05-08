
const testimonials = [
  {
    content: "O AgendPet revolucionou a forma como gerencio meu petshop. Os clientes adoram a facilidade de agendar online e eu economizo horas de trabalho toda semana.",
    author: "Marina Silva",
    role: "Proprietária do PetFeliz",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    content: "Desde que começamos a usar o AgendPet, os agendamentos aumentaram e as faltas diminuíram. O sistema de lembretes automáticos é fantástico!",
    author: "Carlos Oliveira",
    role: "Gerente da ClíniPet",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    content: "Implementamos o AgendPet há 3 meses e já vimos um aumento de 30% nos agendamentos. A interface é intuitiva tanto para nós quanto para os clientes.",
    author: "Ana Beatriz",
    role: "Veterinária na PetSaúde",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

const TestimonialSection = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Depoimentos</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            O que nossos clientes dizem
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="card-hover bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
            >
              <div className="flex-grow">
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
              
              <div className="mt-6 flex items-center">
                <img 
                  className="h-12 w-12 rounded-full" 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                />
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
