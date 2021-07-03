import React from 'react';

export function Container<T>({children}: React.PropsWithChildren<T>) {
    return(
        <div className="container my-12 mx-6 p-4">
            <div className="grid grid-cols-6 grid-rows-4 gap-4 p-4">
                {children}
            </div>
        </div>
    )

}
