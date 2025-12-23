import yinyang from "../assets/images/yin-yang-flowers.png";

const About = () => {
  return (
    <section
      className="flex flex-col md:flex-row items-center justify-center gap-[10vw] w-full min-h-[60vh]"
      id="about"
    >
      <div className="flex-1 flex items-center justify-center">
        <img src={yinyang} alt="Yin Yang" className="max-w-[500px] object-cover" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h2 className="font-regitha fl-text-2xl/4xl">How does it work?</h2>
        <p className="fl-text-lg/2xl font-beezle text-center">
          The fake flowers are generated using a Generative Adversarial Network (GAN). The model uses
          two components: a generator that creates fake flowers, and a discriminator that judges them.
        </p>
        <p className="fl-text-lg/2xl font-beezle text-center">
          These components are trained with opposite goals. The generator learns to create realistic
          fakes, while the discriminator learns to spot the difference between real and generated flowers.
        </p>
      </div>
    </section>
  );
};

export default About;
