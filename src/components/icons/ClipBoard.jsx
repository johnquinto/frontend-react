import React from "react";

const ClipBoard = ({ color, width, height }) => {
  return (
    
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={width}
        height={height}
      >
        <path
          d="M16 3C14.742188 3 13.847656 3.890625 13.40625 5L6 5L6 28L26 28L26 5L18.59375 5C18.152344 3.890625 17.257813 3 16 3 Z M 16 5C16.554688 5 17 5.445313 17 6L17 7L20 7L20 9L12 9L12 7L15 7L15 6C15 5.445313 15.445313 5 16 5 Z M 8 7L10 7L10 11L22 11L22 7L24 7L24 26L8 26Z"
          fill={color}
        />
      </svg>
    
  );
};

export default ClipBoard;
