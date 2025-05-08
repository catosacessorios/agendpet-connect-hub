
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingSection from "@/components/home/PricingSection";

const Precos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Planos e preços do </span>
                <span className="block text-primary-400">AgendPet</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Escolha o plano perfeito para o seu petshop.
                Comece gratuitamente e faça upgrade conforme seu negócio cresce.
              </p>
            </div>
          </div>
        </div>
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Precos;
