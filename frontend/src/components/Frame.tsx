interface FrameProps {
  children: React.ReactNode;
  color?: string;
  hoverColor?: string;
  topClass?: string;
  midClass?: string;
  bottomClass?: string;
}

const Frame = ({ children, color, hoverColor, topClass, midClass, bottomClass }: FrameProps) => {
  const glareStyle = {
    height: "1px",
    backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, ${
      color || "#dbdbdb"
    } 50%, rgba(0, 0, 0, 0) 100%)`,
  };

  const frameStyle = {
    "--gradient-color": hoverColor || color || "#195277",
    "--opacity": color && 0.1,
  } as React.CSSProperties;

  return (
    <div className={`flex flex-col justify-center items-center w-full h-full ${topClass}`}>
      <div className={midClass}>
        <div className="w-10/12 mx-auto" style={glareStyle} />
        <div
          className={`flex-col h-full items-center bg-[#181818] border border-[--border-color] rounded-3xl p-3 mx-auto ${
            color && "frame-bg"
          } ${bottomClass}`}
          style={frameStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Frame;
