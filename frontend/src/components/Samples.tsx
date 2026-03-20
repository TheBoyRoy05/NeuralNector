import samples from "../assets/images/epochs.png";
import Frame from "./Frame";

const Samples = () => {
  return (
    <section
      className="flex flex-col-reverse lg:flex-row items-center justify-center gap-[10vw] w-full min-h-[60vh] mb-[15vh] md:mb-[5vh]"
      id="samples"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h2 className="font-regitha fl-text-3xl/4xl text-center max-w-[500px] lg:max-w-none">Two Rivals Sharpening Each Other</h2>
        <p className="fl-text-lg/xl font-beezle text-center max-w-[500px] lg:max-w-none">
          At first, both the generator and discriminator don't know what they're doing. The generator creates random noise, and the discriminator guesses randomly.
        </p>
        <p className="fl-text-lg/xl font-beezle text-center max-w-[500px] lg:max-w-none">
          By the 16th epoch, the discriminator has learned to tell apart noise, and so the generator has learned to put bright colors at the center and darker colors towards the edges to fool the discriminator.
        </p>
        <p className="fl-text-lg/xl font-beezle text-center max-w-[500px] lg:max-w-none">
          By the 200th epoch, the generator has learned some more patterns and the flowers start to take shape. However, there are still some artifacts in the images.
        </p>
        <p className="fl-text-lg/xl font-beezle text-center max-w-[500px] lg:max-w-none">
          By the 3000th epoch, the generator is able to create realistic flowers. It even starts to understand leaves in the background and even certain lighting effects.
        </p>
        <p className="fl-text-lg/xl font-beezle text-center max-w-[500px] lg:max-w-none">
          At this point, it becomes a challenge for even humans to tell the difference between real and fake flowers (for 64x64 images). That's where this game comes in. You are now the discriminator. Can <span className="font-bold font-regitha">you</span> tell the difference?
        </p>
        <a
          href="https://www.neuralnector.com/report.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-lg md:w-36"
        >
          Report
        </a>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Frame>
          <div className="glare w-full" />
          <img src={samples} alt="Samples" className="border border-slate-500 rounded-xl" />
        </Frame>
      </div>
    </section>
  )
}

export default Samples