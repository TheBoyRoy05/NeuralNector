export interface ImageProps {
  image_data: string;
  is_real: boolean;
  score: number;
}

const Image = ({ image_data, is_real, score }: ImageProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img src={image_data} alt="Image" className="w-[128px] h-[128px] object-cover" />
      <p>{is_real ? "Real" : "Fake"}</p>
      <p>{score}</p>
    </div>
  )
}

export default Image