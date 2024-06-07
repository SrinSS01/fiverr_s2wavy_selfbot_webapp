'use client'

import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { SelfBotUsers } from "@/app/page";

interface TokenInputProps {
	resetUsers?: (value: ( ( (prevState: SelfBotUsers[]) => SelfBotUsers[] ) | SelfBotUsers[] )) => void
}

export default function TokenInput({ resetUsers }: TokenInputProps) {
	const [ token, setToken ] = useState("")
	const [ error, setError ] = useState<string | undefined>();

	const handleAddClick = async () => {
		if ( token.trim().length === 0 ) {
			return;
		}

		try {
			const response = await fetch('http://127.0.0.1:8090/self_bot_users', {
				method: 'POST',
				body: JSON.stringify({
					token: token,
				}),
				cache: 'no-store',
			});

			if ( !response.ok ) {
				const errorJson = await response.json();
				setError(JSON.stringify(errorJson));
				setTimeout(() => setError(undefined), 5000)
			} else {
				setError(undefined); // Clear any previous error
				if ( resetUsers ) {
					fetch("http://127.0.0.1:8090/self_bot_users", { cache: "no-store" })
						.then(res => res.json())
						.then(_json => resetUsers(_json))
						.catch(console.error);
					console.log("reset users");
				}
			}
			setToken("")
		} catch ( error ) {
			console.error('Error fetching data:', error);
			setError('An error occurred while fetching data.');
		}
	};

	return (
		<div className={ "m-10 flex flex-col font-bold align-middle items-center" }>
			<div className={ "flex outline outline-2 w-fit" }>
				<input
					className={ "pl-2 pr-5 text-black" }
					type="text"
					placeholder="Enter Token"
					onChange={ (event) => setToken(event.target.value) }
				/>
				<input className={ "p-2 pl-4 pr-4 bg-gray-800 hover:bg-gray-500 active:bg-gray-800" } type="button"
					   value="add" onClick={ handleAddClick }/>
			</div>
			<div className={ error ? "absolute bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2" : "" }>{ error ?? "" }</div>
		</div>
	);
}
