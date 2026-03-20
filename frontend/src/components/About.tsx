import yinyang from "../assets/images/yin-yang-flowers.png";

const About = () => {
  return (
    <section
      className="flex flex-col md:flex-row items-center justify-center gap-[10vw] w-full min-h-[60vh] mb-[15vh] md:mb-[5vh]"
      id="about"
    >
      <div className="flex-1 flex items-center justify-center min-w-0 px-[10vw] md:px-0">
        <img src={yinyang} alt="Yin Yang" className="max-w-[500px] w-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h2 className="font-regitha fl-text-3xl/4xl">How Does it Work?</h2>
        <p className="fl-text-lg/2xl font-beezle text-center">
          The fake flowers are generated using a Generative Adversarial Network (GAN). The model
          uses two components: a generator that creates fake flowers, and a discriminator that
          judges them.
        </p>
        <p className="fl-text-lg/2xl font-beezle text-center">
          These components are trained with opposite goals. The generator learns to create realistic
          fakes, while the discriminator learns to spot the difference between real and generated
          flowers.
        </p>
        <a
          href="https://www.issacroy.com/neural-nector"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-lg md:btn-xl mt-6"
        >
          Learn More
        </a>
      </div>
    </section>
  );
};

export default About;
