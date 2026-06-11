import { CircleCheckBig } from "lucide-react";

function SuccessMessage({content}: {content: string}) {
    return(
        <div className="mr-10 -mt-16 w-fit bg-green-300 h-fit p-3 rounded-xl flex transition-all duration-700 ease-out animate-bounce">
            <CircleCheckBig />
            <span className="ml-2">{content}</span>
        </div>
    )
}

export default SuccessMessage;