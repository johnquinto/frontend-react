import React from "react";

const AllTasksDone = ({ color, width , height}) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={width}
        height={height}        
      >
        <path
          d="M12 8C9.791 8 8 9.791 8 12L8 44C8 46.209 9.791 48 12 48L44 48C46.209 48 48 46.209 48 44L48 12C48 9.791 46.209 8 44 8L12 8 z M 51 16L51 46C51 48.761 48.761 51 46 51L16 51L16 52C16 54.209 17.791 56 20 56L52 56C54.209 56 56 54.209 56 52L56 20C56 17.791 54.209 16 52 16L51 16 z M 38.960938 18L42 21L25 38L14 27L16 24L25 30L38.960938 18 z"
          fill={color}
        />
      </svg>
    </>
  );
};

export default AllTasksDone;
