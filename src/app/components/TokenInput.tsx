'use client'

import React, { useState } from 'react';
import { SelfBotUsers } from "@/app/page";
import { APIEndPoint } from '../config/Config';
import Loading from "../icons/Loading.gif";
import Image from 'next/image';

interface TokenInputProps {
	resetUsers?: (value: ( ( (prevState: SelfBotUsers[]) => SelfBotUsers[] ) | SelfBotUsers[] )) => void
}

export default function TokenInput({ resetUsers }: TokenInputProps) {
	const [ token, setToken ] = useState("")
	const [ error, setError ] = useState<string | undefined>();
	const [ loadingAnimation, setLoadingAnimation ] = useState(false);

	const handleAddClick = async () => {
		if ( token.trim().length === 0 ) {
			return;
		}

		setLoadingAnimation(true);
		try {
			const response = await fetch(`${APIEndPoint}/self_bot_users`, {
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
					fetch(`${APIEndPoint}/self_bot_users`, { cache: "no-store" })
						.then(res => res.json())
						.then(_json => resetUsers(_json))
						.catch(console.error);
				}
			}
		} catch ( error ) {
			console.error('Error fetching data:', error);
			setError('An error occurred while fetching data.');
		} finally {
			setLoadingAnimation(false);
		}
	};

	return (
		<div className={ "m-10 flex flex-col font-bold align-middle items-center h-11" }>
			<div className={ "flex outline outline-2 w-fit h-full" }>
				<input
					className={ "pl-2 pr-5 text-black" }
					type="text"
					placeholder="Enter Token"
					onChange={ (event) => setToken(event.target.value) }
				/>
				{ !loadingAnimation && <input className={ "p-2 pl-4 pr-4 bg-gray-800 hover:bg-gray-500 active:bg-gray-800" }
					   type="button"
					   value="add" onClick={ handleAddClick }/> }
				{
					loadingAnimation && <Image src={ Loading } alt={"loading"} className={"p-2 pl-4 pr-4 bg-gray-800 hover:bg-gray-500 active:bg-gray-800"}/>
				}
			</div>
			<div className={ error ? "absolute bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2" : "" }>{ error ?? "" }</div>
		</div>
	);
}
