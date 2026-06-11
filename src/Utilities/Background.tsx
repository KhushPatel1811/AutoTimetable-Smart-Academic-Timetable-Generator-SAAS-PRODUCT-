import { Fragment } from "react/jsx-runtime";

function BackGround() { 
    return (
        <Fragment>
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 overflow-hidden">

            {/* Glow Spots */}
            <div className="absolute -top-30 -left-25 h-80 w-80 rounded-full bg-indigo-300 opacity-40 blur-3xl animate-pulse" />
            <div className="absolute -bottom-25 -right-25 h-75 w-75 rounded-full bg-cyan-300 opacity-40 blur-3xl animate-pulse" />
            <div className="absolute top-[40%] left-[45%] h-55 w-55 rounded-full bg-pink-300 opacity-30 blur-3xl animate-pulse" />
            </div>
        </Fragment>)
}

export default BackGround;