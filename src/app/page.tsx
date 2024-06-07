'use client'

import { useEffect, useState } from "react";
import TokenInput from "./components/TokenInput";
import ShowConfig from "./components/ShowConfig";
import PlayIcon from "./icons/Play.svg"
import StopIcon from "./icons/Stop.svg"
import EditIcon from "./icons/Edit.svg"
import Image from "next/image";

type SelfBotUsers = {
  user_id: string;
  name: string;
  avatar: string;
};

export type { SelfBotUsers };

export default function Home() {
  const [users, setUsers] = useState<SelfBotUsers[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelfBotUsers>();
  const [showConfig, setShowConfig] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number>()
  useEffect(() => {
    fetch("https://studious-broccoli-vr7j4qg6p492xppj-8090.app.github.dev/self_bot_users", { cache: "no-store" })
    .then(res => res.json())
    .then(_json => setUsers(_json))
    .catch(console.error);
  }, []);
  return (
    <>
      {
        showConfig?
        <div className={"text-white"}>{ selectedUser ? <ShowConfig user={selectedUser} />: "Null" }</div>
        :
        <div className={"flex flex-col outline outline-2 p-5 w-[700px]"}>{
          users.map((user, index) => 
          <div
           key={index} 
           className={"flex justify-between items-center hover:bg-gray-700 p-2 pl-4 pr-4"}
           onMouseEnter={ () => { setHoverIndex(index) } } 
           onMouseLeave={ () => { setHoverIndex(undefined) } }>
           <div className={"flex items-center gap-5"}>
            <img className={"rounded-full"} src={`https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=256`} width={ 100 } alt={user.name}></img>
            <div className={"flex flex-col"}>
              <span className={"text-3xl font-bold"}>{user.name}</span>
              <span>{user.user_id}</span>
            </div>
           </div>
           <div className={"flex items-center gap-2"}>
            <Image className={`${hoverIndex == index? "block": "hidden"} cursor-pointer`} src={ PlayIcon } alt="play"/>
            <Image className={`${hoverIndex == index? "block": "hidden"} cursor-pointer`} src={ StopIcon } alt="stop"/>
            <Image className={`${hoverIndex == index? "block": "hidden"} cursor-pointer`} src={ EditIcon } alt="edit" onClick={ () => { setShowConfig(true); setSelectedUser(user); }}/>
           </div>
          </div>)
         }
         <TokenInput/>
       </div>
      }
    </>
  );
}
