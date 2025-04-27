import React from "react";
import Image from "next/image";
import { IBook } from "../models/Book";
import { getMediaColor, isColorDark } from "../utils/colors";
import { Tag } from "./ui/Tag";

interface BookCardProps {
  book: IBook;
  onClick?: () => void;
  className?: string;
  compactSize?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onClick,
  className = "",
  compactSize = false,
}) => {
  // Generate color based on book title
  const backgroundColor = getMediaColor(book.title);
  const textColor = isColorDark(backgroundColor) ? "text-white" : "text-black";

  // Define sizing based on compact parameter
  const sizeClasses = compactSize
    ? "w-36 h-48 mx-2 shrink-0"
    : "aspect-[2/3] w-full";

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:scale-103 rounded-lg shadow-md ${sizeClasses} ${className}`}
      onClick={onClick}
    >
      {/* Book cover */}
      {book.image ? (
        <Image
          src={book.image}
          alt={book.title}
          fill
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full" style={{ backgroundColor }}></div>
      )}

      {/* Color gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t"
        style={{
          backgroundImage: `linear-gradient(to top, ${backgroundColor}, ${backgroundColor}00)`,
        }}
      ></div>

      {/* Vertical bottom gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      {/* Metadata badges */}
      <div className="absolute top-0 right-0 p-3">
        <div className="flex flex-col items-end gap-1.5">
          {/* Song count badge */}
          {book.songCount > 0 && (
            <span className="px-2.5 py-1 text-xs text-white rounded-full backdrop-blur-sm"
              style={{ backgroundColor: `${backgroundColor}` }}>
              {" "}
              {book.songCount}
              {" songs"}
            </span>
          )}

          {/* Year tag */}
          {book.year && (
            <>
            <span className="px-2.5 py-1 text-xs rounded-full bg-white/30 backdrop-blur-sm text-white">
                {book.year}{" "}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Book info at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="relative z-10 p-3 pb-3">
          <h3 className="mb-2 text-base font-bold leading-tight text-white line-clamp-2">
            {book.title}
          </h3>
          <p
            className="max-w-full text-xs font-medium line-clamp-2 mix-blend-lighten opacity-80"
            style={{
              color: isColorDark(backgroundColor)
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.75)",
            }}
          >
            {book.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
