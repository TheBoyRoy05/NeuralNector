const Footer = () => {
  return (
    <footer className="flex items-center justify-center w-full p-8">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Neural Nector -{" "}
        <a
          href="https://github.com/TheBoyRoy05"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Issac Roy
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
