import Image from 'next/image';
import dynamic from 'next/dynamic';

const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

const ClientLogos = () => {
  const clients = [
    { name: 'TechCorp', logo: '/images/clients/techcorp.svg' },
    { name: 'InnovateX', logo: '/images/clients/innovatex.svg' },
    { name: 'GlobalTech', logo: '/images/clients/globaltech.svg' },
    { name: 'Nexus', logo: '/images/clients/nexus.svg' },
    { name: 'Vertex', logo: '/images/clients/vertex.svg' },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Trusted by Industry Leaders</h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {clients.map((client, index) => (
            <MotionDiv
              key={client.name}
              className="relative h-12 w-32 grayscale hover:grayscale-0 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Image
                src={client.logo}
                alt={client.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
