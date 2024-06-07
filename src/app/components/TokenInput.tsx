'use client'

import React, { useRef, useState } from 'react';

export default function TokenInput() {
  const tokenRef = useRef('');
  const [error, setError] = useState<string | undefined>();

  const handleAddClick = async () => {
    if (tokenRef.current.trim().length === 0) {
      return;
    }

    try {
      const response = await fetch('https://studious-broccoli-vr7j4qg6p492xppj-8090.app.github.dev/self_bot_users', {
        method: 'POST',
        body: JSON.stringify({
          token: tokenRef.current,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorJson = await response.json();
        setError(JSON.stringify(errorJson));
        setTimeout(() => setError(undefined), 5000)
      } else {
        setError(undefined); // Clear any previous error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    }
  };

  return (
    <div className={"m-10 flex flex-col font-bold align-middle items-center"}>
      <div className={"flex outline outline-2 w-fit"}>
        <input    
            className={"pl-2 pr-5 text-black"}
            type="text"
            placeholder="Enter Token"
            onChange={(event) => (tokenRef.current = event.target.value)}
        />
        <input className={"p-2 pl-4 pr-4 bg-gray-800 hover:bg-gray-500 active:bg-gray-800"} type="button" value="add" onClick={handleAddClick} />
      </div>
      <div className={ error ? "absolute bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2": ""}>{ error ?? "" }</div>
    </div>
  );
}