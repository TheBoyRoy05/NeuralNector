export interface ImageProps {
  image_data: string;
  is_real: boolean;
  score: number;
}

const Image = ({ image_data, is_real, score }: ImageProps) => {
  return (
    <div>
      <img src={image_data} alt="Image" />
      <p>{is_real ? "Real" : "Fake"}</p>
      <p>{score}</p>
    </div>
  )
}

export default Image