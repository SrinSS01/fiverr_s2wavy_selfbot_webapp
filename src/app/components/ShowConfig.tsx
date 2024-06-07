'use client'

import { useState } from "react";
import { SelfBotUsers } from "../page";


export default function ShowConfig({ user }: { user: SelfBotUsers; }) {
    // const [] = useState()
    return <div>
        { user.name }
    </div>
}