"use client";

import { useRef, useState } from "react";

export const Title = ({
  initialData
}: any) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length)
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTitle(event.target.value);
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="px-2 h-7 focus-visible:ring-transparent"
        />
      ) : (
        <button
          onClick={enableInput}
        //   variant="ghost"
        //   size="sm"
          className="h-auto p-1 font-normal"
        >
          <span className="truncate">
            {initialData?.title}
          </span>
        </button>
      )}
    </div>
  )
}

Title.Skeleton = function TitleSkeleton() {
  return (
    // <Skeleton className="w-20 rounded-md h-9" />
    <></>
  );
};
