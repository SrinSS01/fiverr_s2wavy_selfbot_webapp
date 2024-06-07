'use client'

import React, { useEffect, useState } from "react";
import { SelfBotUsers } from "../page";
import Close from "../icons/Close.svg"
import Image from "next/image";

type Server = {
	id: string;
	name: string;
	icon?: string;
};

export default function ShowConfig({ user, setShowConfig }: {
	user: SelfBotUsers,
	setShowConfig?: (value: ( ( (prevState: boolean) => boolean ) | boolean )) => void
}) {
	const [ servers, setServers ] = useState<Server[]>([])
	const [ error, setError ] = useState<string | undefined>();
	// const [ hoverIndex, setHoverIndex ] = useState<number>()
	useEffect(() => {
		fetch(`http://127.0.0.1:8090/servers/${ user.user_id }`)
			.then(res => res.json())
			.then(_json => setServers(_json))
			.catch(console.error);
	}, []);
	return <div className={ "flex flex-col gap-5" }>
		<Image className={ "fixed top-10 right-10 cursor-pointer" } src={ Close } alt={ "close" } onClick={ () => {
			if ( setShowConfig ) {
				setServers([]);
				setShowConfig(false);
			}
		} }/>
		<div className={ "flex flex-row gap-5" }>
			<div className={ "flex-1 overflow-auto" }>
				{ servers.map((server, index) =>
					<div
						className={ "flex gap-5 items-center relative hover:bg-gray-800 p-5" }
						key={ index }
						/*onMouseEnter={ () => {
							setHoverIndex(index);
						} }
						onMouseLeave={ () => {
							setHoverIndex(undefined)
						} }*/>
						<img
							className={ "rounded-full" }
							width={ 100 }
							src={ server.icon !== null ? `https://cdn.discordapp.com/icons/${ server.id }/${ server.icon }.webp?size=256` : `https://cdn.discordapp.com/embed/avatars/0.png` }
							alt={ server.name }/>
						<div className={ "w-[200px]" }>
							<div className={ "font-bold truncate" }>{ server.name }</div>
							<div>{ server.id }</div>
						</div>
					</div>) }
			</div>
			<div className={ "flex-1 overflow-auto h-fit" }>Test</div>
		</div>
		<div className={ error ? "absolute bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2" : "" }>{ error ?? "" }</div>
	</div>
}
