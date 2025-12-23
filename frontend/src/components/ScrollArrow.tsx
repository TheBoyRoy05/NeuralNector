import { AnimatePresence, motion } from "framer-motion";
import { IoIosArrowDown } from "react-icons/io";
import { scrollTo } from "../Utils/functions";

const ScrollArrow = ({ id, offset }: { id: string, offset: number }) => {
  return (
    <AnimatePresence>
      <motion.div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 cursor-pointer animate-bounce`}
        initial={{ y: 10 }}
        animate={{ y: [0, -10, 0] }}
        exit={{ y: 10 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeIn",
        }}
      >
        <IoIosArrowDown size={40} onClick={() => scrollTo(id, offset)} className="scroll-arrow" />
      </motion.div>
    </AnimatePresence>
  );
};

export default ScrollArrow;
