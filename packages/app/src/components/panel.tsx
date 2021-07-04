import React from "react";

export function Panel<T>({ children }: React.PropsWithChildren<T>) {
  return (
    <div className="col-start-2 col-span-4 row-span-3 bg-yellow-50 border border-solid border-gray-300 rounded-lg shadow p-6">
      {children}
    </div>
  );
}
