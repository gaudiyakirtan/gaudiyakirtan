import React from "react";
import Image from "next/image";
import { IBook } from "../models/Book";
import { getMediaColor, isColorDark } from "../utils/colors";

interface BookCardProps {
  book: IBook;
  onClick?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  // Generate color based on book title
  const backgroundColor = getMediaColor(book.title);
  const textColor = isColorDark(backgroundColor) ? "text-white" : "text-black";

  return (
    <div
      className="relative h-48 mx-2 overflow-hidden transition-transform duration-200 rounded-lg shadow-md cursor-pointer w-36 hover:scale-103 shrink-0"
      onClick={onClick}
    >
      {/* Book cover image or color */}
      <div className="w-full h-full">
        {book.image ? (
          <Image
            src={book.image}
            alt={book.title}
            width={144}
            height={192}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="flex items-center justify-center w-full h-full"
            style={{ backgroundColor }}
          >
          </div>
        )}
      </div>

      {/* Multiple gradient overlays similar to React Native version */}
      {/* Color gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t"
        style={{
          backgroundImage: `linear-gradient(to top, ${backgroundColor}, ${backgroundColor}00)`,
        }}
      ></div>

      {/* Vertical bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      {/* Horizontal left gradient - approximating the complex gradient from React Native */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, #191919, rgba(25,25,25,0) 2.58%, rgba(25,25,25,0.5) 5.15%, rgba(25,25,25,0) 8%, rgba(25,25,25,0) 100%)`,
        }}
      ></div>

      {/* Book info overlay */}
      <div className="absolute bottom-0 left-0 right-0 pb-3 pl-4 text-white pr-[1px]">
        <h3 className="text-lg font-black leading-tight">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs font-medium text-white/90">
            {book.author}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
