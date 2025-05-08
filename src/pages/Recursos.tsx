
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeatureSection from "@/components/home/FeatureSection";

const Recursos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Recursos do </span>
                <span className="block text-primary-400">AgendPet</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Conheça todas as funcionalidades que facilitam a gestão do seu petshop.
              </p>
            </div>
          </div>
        </div>
        <FeatureSection />
      </main>
      <Footer />
    </div>
  );
};

export default Recursos;
